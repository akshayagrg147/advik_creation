import mongoose from 'mongoose';

const findYourFitCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  order: { type: Number, default: 0 },
});

findYourFitCategorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('FindYourFitCategory', findYourFitCategorySchema);
