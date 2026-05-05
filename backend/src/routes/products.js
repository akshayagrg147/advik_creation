import express from 'express';
import Product from '../models/Product.js';
import { generateProductModelImage } from '../lib/productModelGeneration.js';

const router = express.Router();

function normalize(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/'/g, '')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function categoryMatch(value, normalized) {
  const v = (value || '').replace(/'/g, '').toLowerCase();
  const n = normalized.replace(/'/g, '').toLowerCase();
  return v === n;
}

const stripTransientProductFields = (body = {}) => {
  const next = { ...body };
  delete next.autoGenerateModelImage;
  delete next.aiModelPromptNotes;
  return next;
};

const referencesChanged = (product, payload = {}) => {
  const nextMainImage = payload.image ?? product.image;
  const nextImages = payload.images ?? product.images ?? [];
  const currentImages = product.images ?? [];

  return (
    nextMainImage !== product.image ||
    JSON.stringify(nextImages) !== JSON.stringify(currentImages)
  );
};

const maybeGenerateModelShot = async (product, body = {}) => {
  if (body.autoGenerateModelImage !== true) {
    return product;
  }

  try {
    const generated = await generateProductModelImage(product, {
      promptNotes: body.aiModelPromptNotes || '',
    });

    product.generatedModelImage = generated.imageUrl;
    product.generatedModelPrompt = generated.prompt;
    product.generatedModelStatus = 'ready';
    product.generatedModelError = undefined;
    await product.save();
  } catch (error) {
    product.generatedModelImage = undefined;
    product.generatedModelPrompt = undefined;
    product.generatedModelStatus = 'failed';
    product.generatedModelError = error.message;
    await product.save();
  }

  return product;
};

// POST /api/products/preview-model-image - Generate preview without saving product
router.post('/preview-model-image', async (req, res) => {
  try {
    const product = stripTransientProductFields(req.body);
    if (!product.image) {
      return res.status(400).json({ error: 'Add a main image before generating a preview.' });
    }

    const generated = await generateProductModelImage(product, {
      promptNotes: req.body.aiModelPromptNotes || '',
    });

    res.json({
      imageUrl: generated.imageUrl,
      prompt: generated.prompt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/products - All products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ newArrival: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/best-sellers
router.get('/best-sellers', async (req, res) => {
  try {
    const products = await Product.find({ bestSeller: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/unstitched-collections
router.get('/unstitched-collections', async (req, res) => {
  try {
    const products = await Product.find({ unstitchedCollection: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/category/:category
router.get('/category/:category', async (req, res) => {
  try {
    const norm = normalize(req.params.category);
    const products = await Product.find();
    const filtered = products.filter((p) => categoryMatch(p.category, norm));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/subcategory/:subcategory
router.get('/subcategory/:subcategory', async (req, res) => {
  try {
    const norm = normalize(req.params.subcategory);
    const products = await Product.find();
    const filtered = products.filter((p) => categoryMatch(p.subcategory, norm));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/find-your-fit - ?category=...&subcategory=...
router.get('/find-your-fit', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    let query = {};

    if (category === 'New Arrivals') {
      query = { newArrival: true };
    } else if (subcategory) {
      query = { subcategory: normalize(subcategory) };
    } else if (category) {
      query = { category: normalize(category) };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/search?q=...
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.json([]);
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create (admin)
router.post('/', async (req, res) => {
  try {
    const payload = stripTransientProductFields(req.body);
    if (req.body.autoGenerateModelImage === true) {
      payload.generatedModelStatus = 'generating';
      payload.generatedModelError = undefined;
    }

    const product = await Product.create(payload);
    const savedProduct = await maybeGenerateModelShot(product, req.body);
    res.status(201).json(savedProduct.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update (admin)
router.put('/:id', async (req, res) => {
  try {
    const payload = stripTransientProductFields(req.body);
    if (req.body.autoGenerateModelImage === true) {
      payload.generatedModelStatus = 'generating';
      payload.generatedModelError = undefined;
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const shouldClearGeneratedModel = referencesChanged(product, payload) && req.body.autoGenerateModelImage !== true;

    Object.assign(product, payload);
    if (shouldClearGeneratedModel) {
      product.generatedModelImage = undefined;
      product.generatedModelPrompt = undefined;
      product.generatedModelStatus = 'idle';
      product.generatedModelError = undefined;
    }
    await product.save();

    const savedProduct = await maybeGenerateModelShot(product, req.body);
    res.json(savedProduct.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete (admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
