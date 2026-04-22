import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: String,
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema({
  street: String,
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: String,
  country: { type: String, default: 'India' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    items: [orderItemSchema],
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['prepaid', 'partial_cod', 'cod'],
      default: 'prepaid',
    },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    paymentGateway: String,
    paymentId: String,
    paymentOrderId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'failed', 'refunded'],
      default: 'pending',
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderNotes: String,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

orderSchema.virtual('id').get(function () {
  return this._id.toString();
});

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Order', orderSchema);
