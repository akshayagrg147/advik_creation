import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
});

export default mongoose.model('Offer', offerSchema);
