import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  FilmIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadBannerMedia,
  type HeroSlide,
} from '../api/banners';

const HeroBanners = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    overlayOpacity: 0.8,
    overlayColor: 'from-red-900/80 to-red-800/80',
    isActive: true,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHeroSlides();
      setSlides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleAdd = () => {
    setEditingSlide(null);
    setFormData({
      mediaType: 'image',
      mediaUrl: '',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      overlayOpacity: 0.8,
      overlayColor: 'from-red-900/80 to-red-800/80',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      mediaType: (slide.mediaType as 'image' | 'video') || 'image',
      mediaUrl: slide.mediaUrl || slide.image || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      overlayOpacity: slide.overlayOpacity ?? 0.8,
      overlayColor: slide.overlayColor || 'from-red-900/80 to-red-800/80',
      isActive: slide.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteHeroSlide(id);
      setSlides(slides.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url, mediaType } = await uploadBannerMedia(file);
      setFormData((prev) => ({ ...prev, mediaUrl: url, mediaType }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl) {
      alert('Please upload an image or video');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        mediaType: formData.mediaType,
        mediaUrl: formData.mediaUrl,
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText || undefined,
        buttonLink: formData.buttonLink || undefined,
        overlayOpacity: formData.overlayOpacity,
        overlayColor: formData.overlayColor,
        isActive: formData.isActive,
        order: editingSlide ? slides.findIndex((s) => s.id === editingSlide.id) : slides.length,
      };
      if (editingSlide) {
        const updated = await updateHeroSlide(editingSlide.id, payload);
        setSlides(slides.map((s) => (s.id === editingSlide.id ? updated : s)));
      } else {
        const created = await createHeroSlide(payload);
        setSlides([...slides, created]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setSlides(reordered);
    for (let i = 0; i < reordered.length; i++) {
      await updateHeroSlide(reordered[i].id, { ...reordered[i], order: i });
    }
    fetchSlides();
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const updated = await updateHeroSlide(slide.id, { isActive: !slide.isActive });
      setSlides(slides.map((s) => (s.id === slide.id ? updated : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button onClick={fetchSlides} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hero Banners</h1>
          <p className="text-gray-600 mt-1">Manage home page hero slides (images & videos)</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-white rounded-lg shadow p-4 flex gap-4 items-center"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
              >
                <ArrowUpIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === slides.length - 1}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
              >
                <ArrowDownIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="w-32 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              {slide.mediaType === 'video' ? (
                <video src={slide.mediaUrl || slide.image} className="w-full h-full object-cover" muted />
              ) : (
                <img
                  src={slide.mediaUrl || slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
                  {slide.mediaType === 'video' ? 'Video' : 'Image'}
                </span>
                {!slide.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-100">Inactive</span>
                )}
              </div>
              <p className="font-semibold text-gray-800 truncate">{slide.title || 'Untitled'}</p>
              <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(slide)}
                className="p-2 text-gray-600 hover:text-gray-800"
                title={slide.isActive ? 'Deactivate' : 'Activate'}
              >
                {slide.isActive ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
              </button>
              <button onClick={() => handleEdit(slide)} className="p-2 text-blue-600 hover:text-blue-800">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(slide.id)} className="p-2 text-red-600 hover:text-red-800">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingSlide ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media (Image or Video)</label>
                <div className="flex gap-4 items-center">
                  <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <p className="text-gray-500">Uploading...</p>
                    ) : formData.mediaUrl ? (
                      <div className="space-y-2">
                        {formData.mediaType === 'video' ? (
                          <video
                            src={formData.mediaUrl}
                            className="max-h-40 mx-auto rounded"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={formData.mediaUrl}
                            alt="Preview"
                            className="max-h-40 mx-auto rounded"
                          />
                        )}
                        <p className="text-sm text-green-600">Click to replace</p>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <FilmIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Upload image or video</p>
                        <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP, MP4, WebM</p>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Or paste URL:</p>
                <input
                  type="url"
                  value={formData.mediaUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mediaUrl: e.target.value,
                      mediaType: /\.(mp4|webm|mov|ogg)(\?|$)/i.test(e.target.value) ? 'video' : 'image',
                    }))
                  }
                  placeholder="https://..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional subtitle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="/new-arrivals"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Opacity (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.overlayOpacity}
                    onChange={(e) =>
                      setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) || 0.8 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Color (Tailwind)</label>
                  <input
                    type="text"
                    value={formData.overlayColor}
                    onChange={(e) => setFormData({ ...formData, overlayColor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="from-red-900/80 to-red-800/80"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on site)
                </label>
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
                  disabled={saving || !formData.mediaUrl}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSlide ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanners;
