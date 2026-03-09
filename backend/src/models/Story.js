import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  category: { type: String, required: true },
  order: { type: Number, default: 0 },
  type: { type: String, enum: ['product', 'reel', 'media'], default: 'product' },
  // Product type
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  productImage: String,
  productVideo: String,
  productPrice: Number,
  productLink: String,
  // Media type (uploaded)
  mediaType: { type: String, enum: ['image', 'video'] },
  mediaUrl: String,
  title: String,
  link: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

storySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    if (ret.productId) ret.productId = ret.productId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Story', storySchema);
