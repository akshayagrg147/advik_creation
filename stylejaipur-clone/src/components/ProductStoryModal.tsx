import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import type { Product } from '../types';
import { getProductPrice } from '../utils/price';
import type { StoryItem } from '../api';

type StorySlide = { type: 'product'; product: Product } | { type: 'media'; mediaUrl: string; mediaType?: 'image' | 'video'; title?: string; link?: string };

interface ProductStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  products?: Product[];
  storyItems?: StoryItem[];
  initialIndex?: number;
}

function toSlides(products?: Product[], storyItems?: StoryItem[]): StorySlide[] {
  if (storyItems && storyItems.length > 0) {
    return storyItems.map((s) => {
      if ((s.type === 'product' || s.type === 'reel') && s.product) {
        const p = s.product as Product & { _id?: string };
        const product: Product = {
          ...p,
          id: p.id || p._id?.toString() || '',
          sizes: p.sizes || ['M-38', 'L-40', 'XL-42'],
        };
        return { type: 'product' as const, product };
      }
      return {
        type: 'media' as const,
        mediaUrl: s.mediaUrl || s.productImage || '',
        mediaType: (s.mediaType as 'image' | 'video') || 'image',
        title: s.title || s.productName,
        link: s.link || s.productLink,
      };
    });
  }
  if (products && products.length > 0) {
    return products.map((p) => ({ type: 'product' as const, product: p }));
  }
  return [];
}

function createReactionState(slides: StorySlide[]) {
  const likes: Record<string, number> = {};
  const liked: Record<string, boolean> = {};

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const id = slide.type === 'product' && slide.product ? (slide.product.id || `product-${i}`) : `media-${i}`;
    likes[id] = Math.floor(Math.random() * 50) + 10;
    liked[id] = false;
  }

  return { likes, liked };
}

const ProductStoryModal = ({
  isOpen,
  onClose,
  category,
  products = [],
  storyItems,
  initialIndex = 0,
}: ProductStoryModalProps) => {
  const slides = useMemo(() => toSlides(products, storyItems), [products, storyItems]);
  const safeInitialIndex = slides.length > 0 ? Math.min(initialIndex, slides.length - 1) : 0;
  const initialReactions = useMemo(() => createReactionState(slides), [slides]);
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [likes, setLikes] = useState<Record<string, number>>(initialReactions.likes);
  const [liked, setLiked] = useState<Record<string, boolean>>(initialReactions.liked);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, slides.length]);

  if (!isOpen || slides.length === 0) return null;

  const currentIndexSafe = Math.min(currentIndex, slides.length - 1);
  const current = slides[currentIndexSafe];
  if (!current) return null;

  const progress = ((currentIndexSafe + 1) / slides.length) * 100;
  const slideId = current.type === 'product' ? (current.product?.id || `product-${currentIndexSafe}`) : `media-${currentIndexSafe}`;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1);
    else onClose();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleLike = () => {
    setLiked((prev) => ({ ...prev, [slideId]: !prev[slideId] }));
    setLikes((prev) => ({
      ...prev,
      [slideId]: prev[slideId] + (liked[slideId] ? -1 : 1),
    }));
  };

  const handleAddToCart = () => {
    if (current.type === 'product' && current.product) {
      const p = current.product;
      const unstitchedNoSizes = (p as Product & { unstitchedCollection?: boolean }).unstitchedCollection && (!p.sizes || p.sizes.length === 0);
      if (unstitchedNoSizes) {
        addToCart(p, 'Unstitched');
      } else if (effectiveSelectedSize) {
        addToCart(p, effectiveSelectedSize);
      }
    }
  };

  const prod = current.type === 'product' ? current.product : null;
  const isUnstitchedNoSizes = prod && (prod as Product & { unstitchedCollection?: boolean }).unstitchedCollection && (!prod.sizes || prod.sizes.length === 0);
  const effectiveSelectedSize =
    prod?.sizes?.find((size) => size === selectedSize) || prod?.sizes?.[0] || '';
  const canAddToCart = current.type === 'product' && prod && (isUnstitchedNoSizes || effectiveSelectedSize);
  const productVideo = current.type === 'product' && prod ? (prod as Product & { video?: string }).video : undefined;
  const mediaUrl =
    current.type === 'product' && prod
      ? productVideo || prod.image
      : (current as { mediaUrl?: string }).mediaUrl;
  const isVideo =
    (current.type === 'product' && !!productVideo) ||
    (current.type === 'media' && current.mediaType === 'video');
  const displayTitle = current.type === 'product' && prod ? prod.name : (current as { title?: string }).title || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md h-[85vh] max-h-[700px] bg-black rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-20">
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <img
                src="https://stylejaipur.com/cdn/shop/files/Untitled_design_1_960da92b-5caf-4162-884c-f214ea0b45cf_x320.png?v=1720204689"
                alt="Advik Creation"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-white font-semibold">{category}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-white hover:text-gray-300 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="relative w-full h-full flex items-center justify-center"
          onTouchStart={(e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }}
          onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
          onTouchEnd={() => {
            if (touchStart != null && touchEnd != null) {
              const d = touchStart - touchEnd;
              if (d > 50) handleNext();
              if (d < -50) handlePrevious();
            }
          }}
        >
          {isVideo ? (
            <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <img src={mediaUrl} alt={displayTitle} className="w-full h-full object-cover" />
          )}

          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer" onClick={handlePrevious} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer" onClick={handleNext} />
        </div>

        {current.type === 'product' && (
          <div className="absolute bottom-24 right-4 flex flex-col items-center gap-2 z-10">
            <button onClick={handleLike} className="text-white hover:text-red-500 transition">
              <svg
                className={`w-8 h-8 ${liked[slideId] ? 'fill-red-500' : 'fill-none'}`}
                stroke="currentColor"
                fill={liked[slideId] ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <span className="text-white text-sm font-semibold">{likes[slideId] ?? 0}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-10">
          <div className="flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white flex-shrink-0">
              {isVideo ? (
                <video src={mediaUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img src={mediaUrl} alt={displayTitle} className="w-full h-full object-cover" />
              )}
              {(current.type === 'product' || (current.type === 'media' && current.link)) && (
                <Link
                  to={current.type === 'product' && prod ? `/product/${prod.id}` : (current.type === 'media' ? current.link || '#' : '#')}
                  className="absolute top-1 right-1 text-white bg-black/50 rounded-full p-1"
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-1 truncate">{displayTitle}</h3>
              {current.type === 'product' && prod && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white text-gray-900 px-2 py-1 rounded font-bold text-sm">
                      ₹{getProductPrice(prod, effectiveSelectedSize).toLocaleString()}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-white/60 line-through text-sm">
                        ₹{prod.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {prod.sizes && prod.sizes.length > 1 && !isUnstitchedNoSizes && (
                    <select
                      value={effectiveSelectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full mb-2 px-3 py-2 bg-white/10 text-white border border-white/30 rounded-lg text-sm"
                    >
                      {prod.sizes.map((s) => (
                        <option key={s} value={s} className="text-gray-900">{s}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      ADD TO CART
                    </button>
                    <Link
                      to={`/product/${prod.id}`}
                      onClick={() => onClose()}
                      className="px-4 py-2 border border-white rounded-lg text-white font-semibold hover:bg-white/10 transition shrink-0"
                    >
                      View
                    </Link>
                  </div>
                </>
              )}
              {current.type === 'media' && current.link && (
                <Link
                  to={current.link}
                  onClick={() => onClose()}
                  className="inline-block mt-2 bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-4 right-4 flex gap-1 z-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= currentIndex ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductStoryModal;
