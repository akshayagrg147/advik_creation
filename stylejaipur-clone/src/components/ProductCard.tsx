import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getProductPrice } from '../utils/price';
import { useCart } from '../context/useCart';
import { useState } from 'react';
import { getPrimaryProductImage } from '../utils/productMedia';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'premium';
}

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const { addToCart } = useCart();
  const defaultSize =
    product.sizes?.[0] ||
    (product.unstitchedCollection ? 'Unstitched' : 'Free Size');
  const availableSizes = product.sizes?.length ? product.sizes : [defaultSize];
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const isPremium = variant === 'premium';
  const primaryImage = getPrimaryProductImage(product);

  const handleAddToCart = () => {
    const size = selectedSize || defaultSize;
    addToCart(product, size);
    setShowSizeSelector(false);
  };

  const handleQuickAdd = () => {
    addToCart(product, selectedSize || defaultSize);
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <img
            src={primaryImage}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isPremium ? 'h-72 object-top sm:h-80 lg:h-[360px]' : 'h-64 sm:h-72 lg:h-80'
            }`}
          />
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            {product.bestSeller && (
              <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-950 shadow-sm backdrop-blur">
                Most loved
              </span>
            )}
            {product.discount && (
              <span className="rounded-full bg-red-600/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur">
                Save {product.discount}%
              </span>
            )}
          </div>
          {product.newArrival && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-700/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur">
              NEW
            </span>
          )}

        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-6 text-gray-950 transition hover:text-red-600 sm:text-[17px]">
            {product.name}
          </h3>
        </Link>

        {product.rating && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
            <span className="text-amber-400">★</span>
            <span className="font-medium text-gray-700">{product.rating}</span>
            {product.reviews && <span className="text-gray-400">({product.reviews} reviews)</span>}
          </div>
        )}

        <div className="mb-4 flex items-end gap-2">
          <span className="text-xl font-semibold text-gray-950">
            Rs. {getProductPrice(product, selectedSize).toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="pb-0.5 text-xs text-gray-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {showSizeSelector ? (
          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  className={`rounded-md border px-3 py-1 text-[11px] transition ${
                    selectedSize === size
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => setShowSizeSelector(false)}
              className="w-full text-gray-500 py-1.5 text-xs hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="rounded-lg bg-gray-950 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Quick Add
            </button>
            <button
              type="button"
              onClick={() => setShowSizeSelector(true)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-red-600 hover:text-red-600"
              aria-label="Choose size"
              title="Choose size"
            >
              Size
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
