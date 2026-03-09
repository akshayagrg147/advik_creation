import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceBySize: { type: Map, of: Number, default: () => new Map() }, // e.g. { "M-38": 1500, "L-40": 1600 }
    originalPrice: Number,
    discount: Number,
    image: { type: String, required: true },
    images: [String],
    video: String,
    sizes: { type: [String], default: [] }, // Optional for unstitched collections
    category: { type: String, required: true },
    subcategory: String,
    rating: Number,
    reviews: Number,
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    featured: Boolean,
    bestSeller: Boolean,
    newArrival: Boolean,
    unstitchedCollection: Boolean,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

productSchema.virtual('id').get(function () {
  return this._id.toString();
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.priceBySize && ret.priceBySize instanceof Map) {
      ret.priceBySize = Object.fromEntries(ret.priceBySize);
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Product', productSchema);
