import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get settings (public - used by customer checkout)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'store' });
    if (!settings) {
      settings = await Settings.create({ key: 'store' });
    }
    res.json({
      codEnabled: settings.codEnabled ?? true,
      siteName: settings.siteName,
      siteEmail: settings.siteEmail,
      sitePhone: settings.sitePhone,
      currency: settings.currency,
      taxRate: settings.taxRate,
      shippingCost: settings.shippingCost,
      freeShippingThreshold: settings.freeShippingThreshold,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

// Get checkout-relevant settings only (public - lightweight for customer)
router.get('/checkout', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'store' });
    if (!settings) {
      settings = await Settings.create({ key: 'store' });
    }
    res.json({ codEnabled: settings.codEnabled ?? true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

// Update settings (admin)
router.put('/', async (req, res) => {
  try {
    const { siteName, siteEmail, sitePhone, currency, taxRate, shippingCost, freeShippingThreshold, codEnabled } = req.body;
    let settings = await Settings.findOne({ key: 'store' });
    if (!settings) {
      settings = new Settings({ key: 'store' });
    }
    if (typeof siteName !== 'undefined') settings.siteName = siteName;
    if (typeof siteEmail !== 'undefined') settings.siteEmail = siteEmail;
    if (typeof sitePhone !== 'undefined') settings.sitePhone = sitePhone;
    if (typeof currency !== 'undefined') settings.currency = currency;
    if (typeof taxRate !== 'undefined') settings.taxRate = String(taxRate);
    if (typeof shippingCost !== 'undefined') settings.shippingCost = String(shippingCost);
    if (typeof freeShippingThreshold !== 'undefined') settings.freeShippingThreshold = String(freeShippingThreshold);
    if (typeof codEnabled !== 'undefined') settings.codEnabled = Boolean(codEnabled);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

export default router;
