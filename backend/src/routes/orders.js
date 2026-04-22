import express from 'express';
import Order from '../models/Order.js';
import { sendOrderPaymentEmail } from '../utils/orderEmails.js';

const router = express.Router();

const normalizePhone = (value = '') => value.replace(/\D/g, '').slice(-10);

// GET /api/orders - List all orders
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/customer - List orders for the signed-in customer
router.get('/customer', async (req, res) => {
  try {
    const { phone, email } = req.query;
    const filters = [];
    const normalizedPhone = normalizePhone(String(phone || ''));
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (normalizedPhone) {
      filters.push({ customerPhone: { $regex: `${normalizedPhone}$` } });
    }

    if (normalizedEmail) {
      filters.push({ customerEmail: normalizedEmail });
    }

    if (filters.length === 0) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }

    const orders = await Order.find({ $or: filters }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create order (used by checkout)
router.post('/', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    const order = await Order.create({ ...req.body, orderNumber });

    if (Number(order.amountPaid || 0) > 0) {
      sendOrderPaymentEmail(order).catch((emailError) => {
        console.error(`Failed to send payment email for ${order.orderNumber}:`, emailError);
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id - Update order (e.g. status)
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
