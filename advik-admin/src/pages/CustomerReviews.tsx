import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, StarIcon } from '@heroicons/react/24/outline';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  updateReviewSummary,
  type Review,
  type ReviewSummary,
} from '../api/reviews';
import { uploadBannerMedia } from '../api/banners';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ rating: 4.7, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    product: '',
    date: '',
    image: '',
  });
  const [summaryForm, setSummaryForm] = useState({
    rating: 4.7,
    totalReviews: 2818,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviews();
      setReviews(data.reviews);
      setSummary(data.summary);
      setSummaryForm({
        rating: data.summary.rating,
        totalReviews: data.summary.totalReviews,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingReview(null);
    setFormData({
      name: '',
      review: '',
      product: '',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      image: '',
    });
    setShowModal(true);
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      review: review.review,
      product: review.product || '',
      date: review.date || '',
      image: review.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await uploadBannerMedia(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) {
      alert('Name and review text are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        review: formData.review.trim(),
        product: formData.product.trim() || undefined,
        date: formData.date.trim() || undefined,
        image: formData.image.trim() || undefined,
      };
      if (editingReview) {
        const updated = await updateReview(editingReview.id, payload);
        setReviews(reviews.map((r) => (r.id === editingReview.id ? updated : r)));
      } else {
        const created = await createReview(payload);
        setReviews([...reviews, created]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSummarySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateReviewSummary(summaryForm);
      setSummary(updated);
      setSummaryForm({ rating: updated.rating, totalReviews: updated.totalReviews });
      setShowSummaryModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save summary');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button onClick={fetchData} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
          <p className="text-gray-600 mt-1">Manage customer satisfaction reviews shown on the home page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <StarIcon className="w-5 h-5" />
            Edit Summary
          </button>
          <button
            onClick={handleAdd}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Review
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Review Summary (shown on storefront)</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <StarIcon className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-bold">{summary.rating}</span>
          </div>
          <span className="text-gray-600">from {summary.totalReviews.toLocaleString()} reviews</span>
          <button
            onClick={() => setShowSummaryModal(true)}
            className="text-sm text-red-600 hover:underline"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Individual Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No reviews yet. Click &quot;Add Review&quot; to add one.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow p-4 flex gap-4 items-start"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {review.image ? (
                  <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{review.name}</p>
                {review.product && (
                  <p className="text-sm text-gray-500 mb-1">{review.product}</p>
                )}
                <p className="text-gray-700 line-clamp-2">{review.review}</p>
                {review.date && (
                  <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(review)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Add Review'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text *</label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Great product, loved the quality!"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Off White Embroidered Kurta Set"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="01/04/2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex gap-4 items-center">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 min-w-[120px]">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {uploading ? (
                      <p className="text-sm text-gray-500">Uploading...</p>
                    ) : formData.image ? (
                      <img src={formData.image} alt="Preview" className="max-h-24 mx-auto rounded" />
                    ) : (
                      <>
                        <PhotoIcon className="w-10 h-10 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Upload</p>
                      </>
                    )}
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingReview ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Edit Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Review Summary</h2>
            <p className="text-gray-600 text-sm mb-4">
              This appears as the overall rating and total review count on the customer home page.
            </p>
            <form onSubmit={handleSummarySave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Rating (e.g. 4.7)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={summaryForm.rating}
                  onChange={(e) =>
                    setSummaryForm({ ...summaryForm, rating: parseFloat(e.target.value) || 4.7 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Reviews Count</label>
                <input
                  type="number"
                  min="0"
                  value={summaryForm.totalReviews}
                  onChange={(e) =>
                    setSummaryForm({ ...summaryForm, totalReviews: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
