import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, PhotoIcon, FilmIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
  uploadProductMedia,
} from '../api/products';
import type { Product } from '../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'new-arrivals' | 'best-sellers' | 'unstitched'>('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceBySize: {} as Record<string, string>,
    originalPrice: '',
    category: '',
    subcategory: '',
    stockQuantity: '',
    inStock: true,
    newArrival: false,
    bestSeller: false,
    unstitchedCollection: false,
    image: '',
    images: [] as string[],
    video: '',
    sizes: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'new-arrivals' && product.newArrival) ||
      (categoryFilter === 'best-sellers' && product.bestSeller) ||
      (categoryFilter === 'unstitched' && (product as Product & { unstitchedCollection?: boolean }).unstitchedCollection);
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      priceBySize: {} as Record<string, string>,
      originalPrice: '',
      category: '',
      subcategory: '',
      stockQuantity: '',
      inStock: true,
      newArrival: false,
      bestSeller: false,
      unstitchedCollection: false,
      image: '',
      images: [],
      video: '',
      sizes: ['S-36', 'M-38', 'L-40', 'XL-42'],
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const pbs = (product as Product & { priceBySize?: Record<string, number> }).priceBySize || {};
    const priceBySize: Record<string, string> = {};
    (product.sizes || []).forEach((s) => {
      priceBySize[s] = (pbs[s] ?? product.price).toString();
    });
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      priceBySize,
      originalPrice: (product as Product & { originalPrice?: number }).originalPrice?.toString() || '',
      category: product.category,
      subcategory: product.subcategory || '',
      stockQuantity: (product as Product & { stockQuantity?: number }).stockQuantity?.toString() || '0',
      inStock: product.inStock,
      newArrival: product.newArrival ?? false,
      bestSeller: product.bestSeller ?? false,
      unstitchedCollection: (product as Product & { unstitchedCollection?: boolean }).unstitchedCollection ?? false,
      image: product.image || '',
      images: product.images || [],
      video: (product as Product & { video?: string }).video || '',
      sizes: product.sizes?.length ? [...product.sizes] : ['M-38', 'L-40', 'XL-42'],
    });
    setShowModal(true);
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setUploading(true);
      const { urls } = await uploadProductImages(Array.from(files));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await uploadProductMedia(file);
      setFormData((prev) => ({ ...prev, video: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addSize = () => {
    const s = newSize.trim();
    if (s && !formData.sizes.includes(s)) {
      const basePrice = formData.price || '0';
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, s],
        priceBySize: { ...prev.priceBySize, [s]: basePrice },
      }));
      setNewSize('');
    }
  };

  const removeSize = (idx: number) => {
    const sizeToRemove = formData.sizes[idx];
    setFormData((prev) => {
      const rest = { ...prev.priceBySize };
      delete rest[sizeToRemove];
      return {
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== idx),
        priceBySize: rest,
      };
    });
  };

  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [newSize, setNewSize] = useState('');

  const addImageUrl = () => {
    const url = extraImageUrl.trim();
    if (url) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      setExtraImageUrl('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const mainImage = formData.image || editingProduct?.image || 'https://via.placeholder.com/400';
      if (!editingProduct && !formData.image) {
        alert('Please add a main image (upload or paste URL)');
        setSaving(false);
        return;
      }
      if (!formData.unstitchedCollection && formData.sizes.length === 0) {
        alert('Please add at least one size (not required for Unstitched Collections)');
        setSaving(false);
        return;
      }
      if (!formData.newArrival && !formData.bestSeller && !formData.unstitchedCollection) {
        alert('Please select at least one: New Arrival, Best Seller, or Unstitched Collections');
        setSaving(false);
        return;
      }
      const priceBySize: Record<string, number> = {};
      Object.entries(formData.priceBySize || {}).forEach(([size, val]) => {
        const num = parseFloat(String(val));
        if (!isNaN(num)) priceBySize[size] = num;
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        priceBySize: Object.keys(priceBySize).length > 0 ? priceBySize : undefined,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        inStock: formData.inStock,
        newArrival: formData.newArrival,
        bestSeller: formData.bestSeller,
        unstitchedCollection: formData.unstitchedCollection,
        image: mainImage,
        images: formData.images.length > 0 ? formData.images : undefined,
        video: formData.video || undefined,
        sizes: formData.unstitchedCollection ? (formData.sizes.length > 0 ? formData.sizes : []) : (formData.sizes.length > 0 ? formData.sizes : ['M-38', 'L-40', 'XL-42']),
      };
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts([created, ...products]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <p className="text-gray-600 mb-4">Ensure the backend is running at http://localhost:4000</p>
        <button
          onClick={fetchProducts}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product catalog (from backend)</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
              categoryFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter('new-arrivals')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
              categoryFilter === 'new-arrivals' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => setCategoryFilter('best-sellers')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
              categoryFilter === 'best-sellers' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => setCategoryFilter('unstitched')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
              categoryFilter === 'unstitched' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Unstitched
          </button>
        </div>
      </div>

      {/* Products: table on md+, cards on mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sizes</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labels</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-[180px] truncate">{product.name}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                    {product.sizes?.join(', ') || '—'}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {product.newArrival && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">New</span>
                      )}
                      {product.bestSeller && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">Best</span>
                      )}
                      {(product as Product & { unstitchedCollection?: boolean }).unstitchedCollection && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-800">Unstitched</span>
                      )}
                      {!product.newArrival && !product.bestSeller && !(product as Product & { unstitchedCollection?: boolean }).unstitchedCollection && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">₹{product.price.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                    {(product as Product & { stockQuantity?: number }).stockQuantity ?? 0}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 flex gap-3">
              <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.newArrival && <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">New</span>}
                  {product.bestSeller && <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800">Best</span>}
                  {(product as Product & { unstitchedCollection?: boolean }).unstitchedCollection && <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-800">Unstitched</span>}
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-1">₹{product.price.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <button onClick={() => handleEdit(product)} className="p-2 text-blue-600">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. Women's Wear"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className={formData.unstitchedCollection ? 'opacity-75' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                <p className="text-xs text-gray-500 mb-2">
                  {formData.unstitchedCollection
                    ? 'Not required for Unstitched Collections (optional)'
                    : 'Add the sizes in which this product is available (e.g. S-36, M-38, L-40, XL-42)'}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.sizes.map((size, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    placeholder="e.g. XXL-44"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button type="button" onClick={addSize} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
                    Add size
                  </button>
                </div>
              </div>

              {/* Price by Size */}
              {formData.sizes.length > 0 && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price by Size (optional)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Set different prices for each size. Leave empty or same as base price to use the default.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.sizes.map((size) => (
                      <div key={size}>
                        <label className="block text-xs text-gray-500 mb-1">{size}</label>
                        <input
                          type="number"
                          value={formData.priceBySize[size] ?? formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              priceBySize: { ...prev.priceBySize, [size]: e.target.value },
                            }))
                          }
                          placeholder={formData.price || '0'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media: Main image, multiple images, video */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-800">Media</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Image (required)</label>
                  <div className="flex gap-4 items-start">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 w-32 h-32 cursor-pointer hover:border-red-500 hover:bg-red-50 flex-shrink-0">
                      <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                      {uploading ? (
                        <p className="text-xs text-gray-500">Uploading...</p>
                      ) : formData.image ? (
                        <img src={formData.image} alt="Main" className="w-full h-full object-cover rounded" />
                      ) : (
                        <PhotoIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </label>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Or paste image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-red-500 hover:bg-red-50 w-fit">
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImagesUpload} className="hidden" />
                    <PhotoIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Upload multiple images</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      value={extraImageUrl}
                      onChange={(e) => setExtraImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                    />
                    <button type="button" onClick={addImageUrl} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video (optional)</label>
                  <div className="flex gap-4 items-start">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 w-32 h-32 cursor-pointer hover:border-red-500 hover:bg-red-50 flex-shrink-0">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      {formData.video ? (
                        <video src={formData.video} className="w-full h-full object-cover rounded" muted />
                      ) : (
                        <FilmIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </label>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.video}
                        onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                        placeholder="Or paste video URL (MP4, WebM)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    In Stock
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newArrival"
                    checked={formData.newArrival}
                    onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="newArrival" className="text-sm font-medium text-gray-700">
                    New Arrival
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bestSeller"
                    checked={formData.bestSeller}
                    onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="bestSeller" className="text-sm font-medium text-gray-700">
                    Best Seller
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="unstitchedCollection"
                    checked={formData.unstitchedCollection}
                    onChange={(e) => setFormData({ ...formData, unstitchedCollection: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="unstitchedCollection" className="text-sm font-medium text-gray-700">
                    Unstitched Collections
                  </label>
                </div>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
                At least one of New Arrival, Best Seller, or Unstitched Collections must be selected.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
