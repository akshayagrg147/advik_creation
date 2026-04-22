import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'store' },
    siteName: { type: String, default: 'Advik Creation' },
    siteEmail: { type: String, default: 'order@advikcreation.com' },
    sitePhone: { type: String, default: '+91 9876543210' },
    currency: { type: String, default: 'INR' },
    taxRate: { type: String, default: '18' },
    shippingCost: { type: String, default: '50' },
    freeShippingThreshold: { type: String, default: '1000' },
    codEnabled: { type: Boolean, default: false },
    partialCodEnabled: { type: Boolean, default: true },
    partialCodAdvanceAmount: { type: String, default: '99' },
    prepaidDiscountPercent: { type: String, default: '5' },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
