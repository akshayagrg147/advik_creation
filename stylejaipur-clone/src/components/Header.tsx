import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { getProductPrice } from '../utils/price';
import { searchProducts } from '../api';
import type { Product } from '../types';

const navLinks = [
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Best Sellers', to: '/best-sellers' },
  { label: "Women's Wear", to: '/womens-wear' },
  { label: 'Unstitched', to: '/unstitched-collections' },
];

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getCartItemCount, cart, removeFromCart, updateQuantity, getCartTotal } =
    useCart();

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      {/* Top Banner */}
      <div className="bg-red-600 py-2 text-center text-xs text-white sm:text-sm">
        <p className="mx-auto max-w-5xl px-4 leading-snug">
          <span className="sm:hidden">Extra 5% prepaid today</span>
          <span className="hidden sm:inline">Extra 5% prepaid | Buy 2 get 10% | Buy 3 get 15%</span>
        </p>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200 bg-white/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Left: Mobile hamburger */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 md:hidden"
              aria-label="Open navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="mx-auto flex shrink-0 items-center gap-2 md:mx-0 md:gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-950 text-sm font-semibold tracking-wide text-white shadow-sm">
                AC
              </span>
              <span className="hidden leading-none sm:block">
                <span className="block text-xl font-semibold tracking-wide text-gray-950 md:text-2xl">
                  Advik Creation
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  Indian Fashion Wear
                </span>
              </span>
            </Link>

            {/* Search Bar - desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-6 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for suits, co-ords, gowns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {searchLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </span>
              </div>
              {searchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center text-sm">
                      {searchLoading ? 'Searching...' : 'No products found'}
                    </div>
                  ) : (
                    <ul className="py-2">
                      {searchResults.slice(0, 8).map((product) => (
                        <li key={product.id}>
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => {
                              setSearchQuery('');
                              setSearchOpen(false);
                            }}
                            className="flex gap-3 px-4 py-2 hover:bg-gray-50"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-red-600">
                                Rs. {product.price.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 md:gap-4 ml-4">
              {/* Mobile search icon */}
              <button
                className="md:hidden text-gray-700 hover:text-red-600"
                onClick={() =>
                  document
                    .getElementById('mobile-search-input')
                    ?.focus()
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Account */}
              <button className="hidden sm:inline-flex text-gray-700 hover:text-red-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* Cart */}
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="text-gray-700 hover:text-red-600 relative"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Your Cart
                        </h3>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {cart.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 text-sm">
                            Your cart is empty
                          </p>
                          <Link
                            to="/"
                            onClick={() => setIsCartOpen(false)}
                            className="mt-4 inline-block text-red-600 hover:underline text-sm font-medium"
                          >
                            Continue shopping
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-80 overflow-y-auto space-y-4">
                            {cart.map((item) => (
                              <div
                                key={`${item.product.id}-${item.size}`}
                                className="flex gap-3 border-b border-gray-100 pb-3"
                              >
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-gray-900">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Size: {item.size}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.product.id,
                                            item.size,
                                            item.quantity - 1
                                          )
                                        }
                                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs hover:bg-gray-50"
                                      >
                                        -
                                      </button>
                                      <span className="text-sm">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.product.id,
                                            item.size,
                                            item.quantity + 1
                                          )
                                        }
                                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs hover:bg-gray-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">
                                        Rs.{' '}
                                        {(
                                          getProductPrice(
                                            item.product,
                                            item.size
                                          ) * item.quantity
                                        ).toLocaleString()}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeFromCart(
                                            item.product.id,
                                            item.size
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-sm text-gray-700">
                                Estimated total
                              </span>
                              <span className="font-bold text-lg text-gray-900">
                                Rs. {cartTotal.toFixed(2)}
                              </span>
                            </div>
                            <Link
                              to="/checkout"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full bg-red-600 text-white text-center py-2.5 rounded-full hover:bg-red-700 transition text-sm font-semibold"
                            >
                              Checkout
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:block border-t border-gray-100 bg-white/80">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-8 py-3 text-sm font-medium text-gray-700">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="uppercase tracking-wide hover:text-red-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-3 pb-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search for suits, co-ords, gowns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {searchLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </span>
            </div>

            <nav className="space-y-1 text-sm font-medium text-gray-800">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className="block py-2 border-b border-gray-100 last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
