import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { getCheckoutSettings } from '../api/settings';
import { getProductPrice } from '../utils/price';
import AnimatedSection from '../components/AnimatedSection';
import {
  isFirebasePhoneAuthConfigured,
  sendPhoneOtp,
  type PhoneConfirmationResult,
} from '../lib/firebase';

type PaymentMethod = 'prepaid' | 'cod';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  orderNotes: string;
  paymentMethod: PaymentMethod;
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  orderNotes: '',
  paymentMethod: 'prepaid',
};

const normalizeIndianPhone = (value: string) => value.replace(/\D/g, '').slice(-10);
const formatIndianPhone = (value: string) => `+91${normalizeIndianPhone(value)}`;

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, loginWithPhone, logout } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);

  // Login / OTP verification state
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<PhoneConfirmationResult | null>(null);

  useEffect(() => {
    getCheckoutSettings().then((s) => setCodEnabled(s.codEnabled));
  }, []);

  // Pre-fill contact details from logged-in user
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email || '' }));
    }
    if (user?.phone) {
      setForm((prev) => ({ ...prev, phone: normalizeIndianPhone(user.phone || '') }));
    }
  }, [user?.email, user?.phone]);

  // When COD is disabled, force prepaid
  useEffect(() => {
    if (!codEnabled && form.paymentMethod === 'cod') {
      setForm((prev) => ({ ...prev, paymentMethod: 'prepaid' }));
    }
  }, [codEnabled, form.paymentMethod]);

  const subtotal = getCartTotal();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Special offers: Buy 2 = 10% off, Buy 3+ = 15% off; Prepaid = extra 5% off
  const quantityDiscountPercent = totalQuantity >= 3 ? 15 : totalQuantity >= 2 ? 10 : 0;
  const quantityDiscountAmount = Math.round((subtotal * quantityDiscountPercent) / 100);
  const afterQuantityDiscount = subtotal - quantityDiscountAmount;

  const prepaidDiscountPercent = form.paymentMethod === 'prepaid' ? 5 : 0;
  const prepaidDiscountAmount = Math.round((afterQuantityDiscount * prepaidDiscountPercent) / 100);

  const totalAfterDiscounts = afterQuantityDiscount - prepaidDiscountAmount;
  const shipping = cart.length > 0 ? 50 : 0;
  const finalTotal = totalAfterDiscounts + shipping;

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSendOtp = async () => {
    const phone = normalizeIndianPhone(loginPhone);
    if (!isFirebasePhoneAuthConfigured()) {
      setLoginError('Phone OTP is not configured yet. Please add Firebase environment values.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoginError('');
    setSendingOtp(true);
    try {
      const confirmation = await sendPhoneOtp(formatIndianPhone(phone), 'checkout-recaptcha-container');
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtp('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = normalizeIndianPhone(loginPhone);
    if (!phone || !otp.trim() || !confirmationResult) {
      setLoginError('Please enter mobile number and OTP');
      return;
    }
    setLoginError('');
    setVerifying(true);
    try {
      const credential = await confirmationResult.confirm(otp.trim());
      const token = await credential.user.getIdToken();
      loginWithPhone(formatIndianPhone(phone), token);
      setOtpSent(false);
      setOtp('');
      setConfirmationResult(null);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid or expired OTP');
    } finally {
      setVerifying(false);
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Please enter a valid 10-digit phone number';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Please enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    if (!codEnabled && form.paymentMethod === 'cod') {
      setForm((prev) => ({ ...prev, paymentMethod: 'prepaid' }));
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: Send order to backend when API is ready
      await new Promise((r) => setTimeout(r, 800));
      setOrderPlaced(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AnimatedSection animationType="scale" delay={0}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checkout</p>
          <Link to="/" className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Continue shopping
          </Link>
        </AnimatedSection>
      </div>
    );
  }

  // Login / phone OTP verification step - required before checkout
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <AnimatedSection animationType="fade-up" delay={0}>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        </AnimatedSection>
        <div className="max-w-md mx-auto">
          <AnimatedSection animationType="scale" delay={100}>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verify your mobile number</h2>
            <p className="text-gray-600 mb-6">Please sign in with your phone number to place an order. We&apos;ll send a verification code by SMS.</p>

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => { setLoginPhone(normalizeIndianPhone(e.target.value)); setLoginError(''); }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">India numbers only, +91 will be added automatically.</p>
                </div>
                <div id="checkout-recaptcha-container" />
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70"
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  We sent a 6-digit code to <strong>{formatIndianPhone(loginPhone)}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setLoginError(''); }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center text-lg tracking-widest"
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifying || otp.length !== 6}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70"
                >
                  {verifying ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); setLoginError(''); setConfirmationResult(null); }}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                >
                  Use a different mobile number
                </button>
              </div>
            )}
          </div>
          </AnimatedSection>
          <p className="text-center text-sm text-gray-500 mt-4">
            OTP is sent by Firebase SMS verification. Standard SMS delivery rules may apply.
          </p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <AnimatedSection animationType="scale" delay={0}>
        <div className="max-w-lg mx-auto text-center bg-white border rounded-xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order placed successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. We&apos;ll send you a confirmation email shortly.</p>
          <Link
            to="/"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
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
      <div className="flex items-center justify-between mb-8">
        <AnimatedSection animationType="fade-up" delay={0}>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </AnimatedSection>
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Signed in as {user.phone || user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Information */}
        <div className="lg:col-span-2">
          <AnimatedSection animationType="fade-up" delay={50}>
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={update('addressLine1')}
                  placeholder="House no., Building, Street"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (optional)</label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={update('addressLine2')}
                  placeholder="Area, Landmark"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={update('city')}
                    placeholder="City"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={update('state')}
                    placeholder="State"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={update('pincode')}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea
                  value={form.orderNotes}
                  onChange={update('orderNotes')}
                  placeholder="Delivery instructions, gift message, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
          </AnimatedSection>

          {/* Payment Method */}
          <AnimatedSection animationType="fade-up" delay={100}>
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-red-600 has-[:checked]:bg-red-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethod('prepaid')}
                  className="w-4 h-4 text-red-600"
                />
                <div>
                  <span className="font-medium">Prepaid (UPI / Card / Net Banking)</span>
                  <p className="text-sm text-green-600 mt-0.5">Extra 5% off on prepaid orders</p>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg has-[:checked]:border-red-600 has-[:checked]:bg-red-50 ${
                  codEnabled ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60 bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={() => codEnabled && setPaymentMethod('cod')}
                  disabled={!codEnabled}
                  className="w-4 h-4 text-red-600"
                />
                <div>
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {codEnabled ? 'Pay when you receive' : 'Currently not available'}
                  </p>
                </div>
              </label>
            </div>
          </div>
          </AnimatedSection>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <AnimatedSection animationType="fade-up" delay={150}>
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Size: {item.size} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold shrink-0">Rs. {(getProductPrice(item.product, item.size) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
              </div>
              {quantityDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Buy {totalQuantity} – {quantityDiscountPercent}% off</span>
                  <span className="font-medium">- Rs. {quantityDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {prepaidDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Prepaid – 5% extra off</span>
                  <span className="font-medium">- Rs. {prepaidDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Rs. {shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                <span>Total</span>
                <span>Rs. {finalTotal.toLocaleString()}</span>
              </div>
              {(quantityDiscountAmount > 0 || prepaidDiscountAmount > 0) && (
                <p className="text-xs text-gray-500 mt-1">
                  You save Rs. {(quantityDiscountAmount + prepaidDiscountAmount).toLocaleString()}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing order...' : 'Place order'}
            </button>
            <Link to="/cart" className="block text-center text-red-600 hover:text-red-700 font-medium mt-4">
              ← Back to cart
            </Link>
          </div>
          </AnimatedSection>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
