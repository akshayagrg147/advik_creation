import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getProductPrice } from '../utils/price';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize);
      setShowSizeSelector(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 sm:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Left: discount and best seller stacked so they never overlap */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount && (
              <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded shadow-sm">
                {product.discount}% OFF
              </span>
            )}
            {product.bestSeller && (
              <span className="bg-amber-500 text-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded shadow-sm">
                BEST SELLER
              </span>
            )}
          </div>
          {/* Right: new arrival only */}
          {product.newArrival && (
            <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded shadow-sm">
              NEW
            </span>
          )}

        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 hover:text-red-600 transition text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        {product.rating && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-600">
            <span className="text-yellow-400">⭐</span>
            <span>
              {product.rating}{' '}
              {product.reviews && <span className="text-gray-400">({product.reviews})</span>}
            </span>
          </div>
        )}

        <div className="mb-2 space-y-0.5">
          <span className="block text-lg font-semibold text-gray-900">
            Rs. {getProductPrice(product, selectedSize).toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="block text-[11px] text-gray-400">
              MRP&nbsp;Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {showSizeSelector ? (
          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-[11px] rounded-full border transition ${
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
              onClick={handleAddToCart}
              className="w-full bg-red-600 text-white py-2 rounded-full hover:bg-red-700 transition font-medium text-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={() => setShowSizeSelector(false)}
              className="w-full text-gray-500 py-1.5 text-xs hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSizeSelector(true)}
            className="mt-auto w-full bg-gray-100 text-gray-900 py-2 rounded-full hover:bg-gray-200 transition font-medium text-sm"
          >
            Quick Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

