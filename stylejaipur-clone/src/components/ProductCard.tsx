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
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded">
              {product.discount}% OFF
            </span>
          )}
          {product.newArrival && (
            <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-semibold rounded">
              NEW
            </span>
          )}
          {product.bestSeller && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded">
              BEST SELLER
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-red-600 transition">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2">
          <p className="text-xs text-gray-500">
            {product.sizes.join(' ')}
          </p>
        </div>

        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600">
              {product.rating} {product.reviews && `(${product.reviews})`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            Rs. {getProductPrice(product, selectedSize).toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {showSizeSelector ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-xs border rounded ${
                    selectedSize === size
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Add to Cart
            </button>
            <button
              onClick={() => setShowSizeSelector(false)}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSizeSelector(true)}
            className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Quick Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

