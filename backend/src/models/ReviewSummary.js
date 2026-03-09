import mongoose from 'mongoose';

const reviewSummarySchema = new mongoose.Schema({
  rating: { type: Number, default: 4.7 },
  totalReviews: { type: Number, default: 0 },
});

export default mongoose.model('ReviewSummary', reviewSummarySchema);
