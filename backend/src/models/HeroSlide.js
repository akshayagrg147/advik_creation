import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  mediaUrl: { type: String, required: true },
  // Legacy: image kept for backward compatibility, used when mediaUrl empty
  image: String,
  title: { type: String, default: '' },
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  // Customization
  overlayOpacity: { type: Number, default: 0.8, min: 0, max: 1 },
  overlayColor: { type: String, default: 'from-red-900/80 to-red-800/80' },
  isActive: { type: Boolean, default: true },
});

heroSlideSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    ret.image = ret.mediaUrl || ret.image;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('HeroSlide', heroSlideSchema);
