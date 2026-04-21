import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { getProductById } from '../api';
import { useCart } from '../context/useCart';
import { getProductPrice } from '../utils/price';
import type { Product } from '../types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const infoColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        setProduct(data);
        if (data?.sizes?.length) setSelectedSize(data.sizes[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // GSAP: page enter animation when product is loaded (must run before any early return to keep hooks order consistent)
  useEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => {
      const targets = [imageColRef.current, infoColRef.current].filter(Boolean);
      gsap.fromTo(
        targets,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' }
      );
    }, contentRef.current ?? undefined);
    return () => ctx.revert();
  }, [product]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="w-32 h-32 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">
            {error ?? "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  const isUnstitchedNoSizes = product?.unstitchedCollection && (!product?.sizes || product.sizes.length === 0);
  const effectiveSize = isUnstitchedNoSizes ? 'Unstitched' : selectedSize;

  const handleAddToCart = () => {
    if (product && effectiveSize) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, effectiveSize);
      }
    }
  };

  const images = product.images?.length ? product.images : [product.image];

  return (
    <div ref={contentRef} className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div ref={imageColRef}>
          <div className="mb-4">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-red-600' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div ref={infoColRef}>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          {product.rating != null && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">⭐</span>
              <span className="text-lg font-semibold">{product.rating}</span>
              {product.reviews != null && (
                <span className="text-gray-600">({product.reviews} reviews)</span>
              )}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                Rs. {getProductPrice(product, effectiveSize || selectedSize).toLocaleString()}
              </span>
              {product.originalPrice != null && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                  {product.discount != null && (
                    <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Size Selection - not shown for unstitched with no sizes */}
          {!(product.unstitchedCollection && (!product.sizes || product.sizes.length === 0)) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition ${
                      selectedSize === size
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!effectiveSize || !product.inStock}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button className="w-full bg-gray-100 text-gray-800 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition">
              Buy Now
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-gray-800 mb-4">Product Details</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <strong>Category:</strong> {product.category}
              </li>
              {product.subcategory && (
                <li>
                  <strong>Subcategory:</strong> {product.subcategory}
                </li>
              )}
              {product.sizes?.length ? (
                <li>
                  <strong>Available Sizes:</strong> {product.sizes.join(', ')}
                </li>
              ) : null}
              <li>
                <strong>Status:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
