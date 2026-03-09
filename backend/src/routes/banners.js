import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import Offer from '../models/Offer.js';
import Story from '../models/Story.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ReviewSummary from '../models/ReviewSummary.js';
import FindYourFitCategory from '../models/FindYourFitCategory.js';

const router = express.Router();

// ─── Hero Slides ─────────────────────────────────────────────────────────

router.get('/hero-slides', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const query = all ? {} : { isActive: { $ne: false } };
    const slides = await HeroSlide.find(query).sort({ order: 1 });
    const formatted = slides.map((s) => {
      const obj = s.toJSON();
      obj.image = obj.mediaUrl || obj.image;
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hero-slides', async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/hero-slides/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slide) return res.status(404).json({ error: 'Hero slide not found' });
    res.json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/hero-slides/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Hero slide not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Offers ──────────────────────────────────────────────────────────────

router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ order: 1 });
    res.json(offers.map((o) => o.text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/offers', async (req, res) => {
  try {
    const offer = await Offer.create({ text: req.body.text, order: req.body.order ?? 0 });
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── Reviews ─────────────────────────────────────────────────────────────

router.get('/reviews', async (req, res) => {
  try {
    const [reviews, summaryDoc] = await Promise.all([
      Review.find(),
      ReviewSummary.findOne(),
    ]);
    const summary = summaryDoc || { rating: 4.7, totalReviews: 0 };
    res.json({
      reviews,
      summary: {
        rating: summary.rating,
        totalReviews: summary.totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Summary routes MUST come before :id routes, else "summary" is matched as :id
router.get('/reviews/summary', async (req, res) => {
  try {
    const summary = await ReviewSummary.findOne();
    res.json(summary || { rating: 4.7, totalReviews: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/reviews/summary', async (req, res) => {
  try {
    const { rating, totalReviews } = req.body;
    const summary = await ReviewSummary.findOneAndUpdate(
      {},
      { rating: rating ?? 4.7, totalReviews: totalReviews ?? 0 },
      { new: true, upsert: true }
    );
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Find Your Fit Categories ────────────────────────────────────────────

router.get('/find-your-fit', async (req, res) => {
  try {
    const categories = await FindYourFitCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/find-your-fit', async (req, res) => {
  try {
    const category = await FindYourFitCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/find-your-fit/:id', async (req, res) => {
  try {
    const category = await FindYourFitCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/find-your-fit/:id', async (req, res) => {
  try {
    const category = await FindYourFitCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Stories / Reels ─────────────────────────────────────────────────────

router.get('/stories', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: { $ne: false } };
    if (category) query.category = category;
    const stories = await Story.find(query).sort({ category: 1, order: 1 });
    const withProducts = await Promise.all(
      stories.map(async (s) => {
        const obj = s.toJSON();
        if ((s.type === 'product' || s.type === 'reel') && s.productId) {
          const product = await Product.findById(s.productId);
          if (product) obj.product = product.toJSON();
        }
        return obj;
      })
    );
    res.json(withProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stories/by-category/:category', async (req, res) => {
  try {
    const stories = await Story.find({
      category: req.params.category,
      isActive: { $ne: false },
    })
      .sort({ order: 1 })
      .lean();
    const withProducts = await Promise.all(
      stories.map(async (s) => {
        const obj = { ...s, id: s._id.toString() };
        if ((s.type === 'product' || s.type === 'reel') && s.productId) {
          const product = await Product.findById(s.productId);
          if (product) obj.product = product.toJSON();
        }
        return obj;
      })
    );
    res.json(withProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stories', async (req, res) => {
  try {
    const body = { ...req.body };
    if ((body.type === 'product' || body.type === 'reel') && body.productId) {
      const product = await Product.findById(body.productId);
      if (product) {
        body.productName = product.name;
        body.productImage = product.image;
        body.productPrice = product.price;
        body.productLink = `/product/${product._id}`;
        if (product.video) body.productVideo = product.video;
      }
    }
    const story = await Story.create(body);
    res.status(201).json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/stories/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if ((body.type === 'product' || body.type === 'reel') && body.productId) {
      const product = await Product.findById(body.productId);
      if (product) {
        body.productName = product.name;
        body.productImage = product.image;
        body.productPrice = product.price;
        body.productLink = `/product/${product._id}`;
        if (product.video) body.productVideo = product.video;
      }
    }
    const story = await Story.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/stories/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
