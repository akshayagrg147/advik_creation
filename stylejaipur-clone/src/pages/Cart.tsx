import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { getProductPrice } from '../utils/price';
import AnimatedSection from '../components/AnimatedSection';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const cartTotal = getCartTotal();
  const shipping = cart.length > 0 ? 50 : 0;
  const finalTotal = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <AnimatedSection animationType="scale" delay={0}>
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <svg className="w-32 h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Continue shopping to add items to your cart</p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Continue shopping
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AnimatedSection animationType="fade-up" delay={0}>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <AnimatedSection key={`${item.product.id}-${item.size}`} animationType="slide-right" delay={0}>
              <div
                className="bg-white border rounded-lg p-4 flex gap-4"
              >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <Link
                  to={`/product/${item.product.id}`}
                  className="font-semibold text-gray-800 hover:text-red-600 mb-2 block"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-600 mb-2">Size: {item.size}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      Rs. {(getProductPrice(item.product, item.size) * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <AnimatedSection animationType="fade-up" delay={150} className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Rs. {shipping.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">Rs. {finalTotal.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Taxes included.</p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition mb-4 text-center"
            >
              Checkout
            </Link>

            <Link
              to="/"
              className="block text-center text-red-600 hover:text-red-700 font-medium"
            >
              Continue shopping
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default Cart;
