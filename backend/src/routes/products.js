import express from 'express';
import Product from '../models/Product.js';

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
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update (admin)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
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
