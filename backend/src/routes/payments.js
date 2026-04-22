import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Payment gateway is not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

router.post('/razorpay/order', async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount || 0));

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: req.body.receipt || `advik_${Date.now()}`,
      notes: req.body.notes || {},
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create payment order' });
  }
});

router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification details are required' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ error: 'Payment gateway is not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    res.json({ verified: true });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to verify payment' });
  }
});

export default router;
