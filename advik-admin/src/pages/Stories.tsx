import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { getStories, createStory, updateStory, deleteStory, type Story } from '../api/stories';
import { getProducts } from '../api/products';
import type { Product } from '../types';

const categories = ['New Arrivals', 'Kurta Sets', 'Co-Ords', 'Gowns', 'Dresses', "Men's Wear"];

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [saving, setSaving] = useState(false);
  const [storyType, setStoryType] = useState<'product' | 'reel'>('product');
  const [formData, setFormData] = useState({
    productId: '',
    category: 'New Arrivals' as string,
    order: 0,
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [storiesData, productsData] = await Promise.all([
        getStories(),
        getProducts(),
      ]);
      setStories(storiesData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStories =
    selectedCategory === 'all'
      ? stories
      : stories.filter((s) => s.category === selectedCategory);
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.order - b.order;
  });

  const handleAdd = () => {
    setEditingStory(null);
    setStoryType('product');
    setFormData({
      productId: '',
      category: 'New Arrivals',
      order: stories.filter((s) => s.category === 'New Arrivals').length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setStoryType((story.type === 'media' ? 'product' : story.type) || 'product');
    setFormData({
      productId: story.productId || '',
      category: story.category,
      order: story.order,
      isActive: story.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(id);
      setStories(stories.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleMove = async (story: Story, direction: 'up' | 'down') => {
    const catStories = stories.filter((s) => s.category === story.category).sort((a, b) => a.order - b.order);
    const idx = catStories.findIndex((s) => s.id === story.id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= catStories.length) return;
    const swap = catStories[newIdx];
    try {
      await Promise.all([
        updateStory(story.id, { order: swap.order }),
        updateStory(swap.id, { order: story.order }),
      ]);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to move');
    }
  };

  const toggleActive = async (story: Story) => {
    try {
      const updated = await updateStory(story.id, { isActive: !story.isActive });
      setStories(stories.map((s) => (s.id === story.id ? updated : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Story> = {
        category: formData.category,
        order: formData.order,
        isActive: formData.isActive,
      };
      if (storyType === 'product' || storyType === 'reel') {
        if (!formData.productId) {
          alert('Select a product');
          setSaving(false);
          return;
        }
        payload.type = storyType;
        payload.productId = formData.productId;
      }
      if (editingStory) {
        const updated = await updateStory(editingStory.id, payload);
        setStories(stories.map((s) => (s.id === editingStory.id ? updated : s)));
      } else {
        const created = await createStory(payload);
        setStories([...stories, created]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewUrl = (story: Story) => {
    if (story.type === 'media') return story.mediaUrl || story.productImage;
    if (story.type === 'reel' && story.productVideo) return story.productVideo;
    return story.productImage;
  };

  const getPreviewName = (story: Story) => {
    if (story.type === 'media') return story.title || 'Custom media';
    return story.productName || 'Product';
  };

  const productsWithVideo = products.filter((p) => (p as Product & { video?: string }).video);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading stories...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Stories / Reels</h1>
          <p className="text-gray-600 mt-1">Link products or upload custom images/videos for Find Your Fit</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Story
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {categories.map((category) => {
        const catStories = sortedStories.filter((s) => s.category === category);
        if (selectedCategory !== 'all' && selectedCategory !== category) return null;
        if (catStories.length === 0 && selectedCategory !== 'all') return null;

        return (
          <div key={category} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{category}</h2>
              <p className="text-sm text-gray-500">{catStories.length} story(ies)</p>
            </div>
            <div className="p-6 space-y-4">
              {catStories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No stories. Add one above.</p>
              ) : (
                catStories.map((story, index) => (
                  <div
                    key={story.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMove(story, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      >
                        <ArrowUpIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMove(story, 'down')}
                        disabled={index === catStories.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                      >
                        <ArrowDownIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {story.mediaType === 'video' ? (
                        <video src={getPreviewUrl(story)} className="w-full h-full object-cover" muted />
                      ) : (
                        <img
                          src={getPreviewUrl(story)}
                          alt={getPreviewName(story)}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
                        {story.type === 'media' ? 'Uploaded' : story.type === 'reel' ? 'Reel' : 'Product'}
                      </span>
                      <p className="font-semibold text-gray-800 truncate">{getPreviewName(story)}</p>
                      {(story.type === 'product' || story.type === 'reel') && story.productPrice != null && (
                        <p className="text-sm text-gray-600">₹{story.productPrice.toLocaleString()}</p>
                      )}
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                          story.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                        }`}
                      >
                        {story.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(story)} className="p-2 text-gray-600">
                        {story.isActive ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleEdit(story)} className="p-2 text-blue-600">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(story.id)} className="p-2 text-red-600">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingStory ? 'Edit Story' : 'Add Story'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={storyType === 'product'}
                      onChange={() => setStoryType('product')}
                    />
                    Link to Product (image)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={storyType === 'reel'}
                      onChange={() => {
                        setStoryType('reel');
                        if (formData.productId && !productsWithVideo.find((p) => p.id === formData.productId)) {
                          setFormData((prev) => ({ ...prev, productId: '' }));
                        }
                      }}
                    />
                    Reel (product with video only)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product {storyType === 'reel' && '(only products with video)'}
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">
                    {storyType === 'reel'
                      ? productsWithVideo.length === 0
                        ? 'No products with video — add video in Products first'
                        : 'Select product with video'
                      : 'Select product'}
                  </option>
                  {(storyType === 'reel' ? productsWithVideo : products).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({
                    ...formData,
                    category: e.target.value,
                    order: stories.filter((s) => s.category === e.target.value).length + 1,
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive">Active</label>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingStory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
