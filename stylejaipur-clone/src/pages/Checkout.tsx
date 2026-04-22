import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { createOrder } from '../api/orders';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments';
import { getCheckoutSettings } from '../api/settings';
import { getProductPrice } from '../utils/price';
import AnimatedSection from '../components/AnimatedSection';
import {
  isFirebasePhoneAuthConfigured,
  sendPhoneOtp,
  signInWithGoogle,
  type PhoneConfirmationResult,
} from '../lib/firebase';

type PaymentMethod = 'prepaid' | 'partial_cod' | 'cod';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

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
  paymentMethod: 'partial_cod',
};

const normalizeIndianPhone = (value: string) => value.replace(/\D/g, '').slice(-10);
const formatIndianPhone = (value: string) => `+91${normalizeIndianPhone(value)}`;

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, login, loginWithPhone } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [codEnabled, setCodEnabled] = useState(true);
  const [partialCodEnabled, setPartialCodEnabled] = useState(true);
  const [partialCodAdvanceAmount, setPartialCodAdvanceAmount] = useState(99);
  const [prepaidDiscountPercent, setPrepaidDiscountPercent] = useState(5);
  const [shippingCost, setShippingCost] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  // Login / OTP verification state
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<PhoneConfirmationResult | null>(null);

  useEffect(() => {
    getCheckoutSettings().then((s) => {
      setCodEnabled(s.codEnabled);
      setPartialCodEnabled(s.partialCodEnabled);
      setPartialCodAdvanceAmount(Number(s.partialCodAdvanceAmount) || 99);
      setPrepaidDiscountPercent(Number(s.prepaidDiscountPercent) || 5);
      setShippingCost(Number(s.shippingCost) || 50);
      setFreeShippingThreshold(Number(s.freeShippingThreshold) || 1000);
    });
  }, []);

  // Pre-fill contact details from logged-in user
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email || '' }));
    }
    if (user?.name) {
      setForm((prev) => ({ ...prev, fullName: prev.fullName || user.name || '' }));
    }
    if (user?.phone) {
      setForm((prev) => ({ ...prev, phone: normalizeIndianPhone(user.phone || '') }));
    }
  }, [user?.email, user?.name, user?.phone]);

  // When COD is disabled, force prepaid
  useEffect(() => {
    if (form.paymentMethod === 'cod' && !codEnabled) {
      setForm((prev) => ({ ...prev, paymentMethod: partialCodEnabled ? 'partial_cod' : 'prepaid' }));
    }
    if (form.paymentMethod === 'partial_cod' && !partialCodEnabled) {
      setForm((prev) => ({ ...prev, paymentMethod: 'prepaid' }));
    }
  }, [codEnabled, form.paymentMethod, partialCodEnabled]);

  const subtotal = getCartTotal();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Special offers: Buy 2 = 10% off, Buy 3+ = 15% off; Prepaid = extra 5% off
  const quantityDiscountPercent = totalQuantity >= 3 ? 15 : totalQuantity >= 2 ? 10 : 0;
  const quantityDiscountAmount = Math.round((subtotal * quantityDiscountPercent) / 100);
  const afterQuantityDiscount = subtotal - quantityDiscountAmount;

  const activePrepaidDiscountPercent = form.paymentMethod === 'prepaid' ? prepaidDiscountPercent : 0;
  const prepaidDiscountAmount = Math.round((afterQuantityDiscount * activePrepaidDiscountPercent) / 100);

  const totalAfterDiscounts = afterQuantityDiscount - prepaidDiscountAmount;
  const shipping = cart.length > 0 && totalAfterDiscounts < freeShippingThreshold ? shippingCost : 0;
  const finalTotal = totalAfterDiscounts + shipping;
  const advanceAmount = Math.min(partialCodAdvanceAmount, finalTotal);
  const amountPaidNow =
    form.paymentMethod === 'prepaid' ? finalTotal : form.paymentMethod === 'partial_cod' ? advanceAmount : 0;
  const amountDueOnDelivery = Math.max(finalTotal - amountPaidNow, 0);

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const collectOnlinePayment = async (): Promise<RazorpaySuccessResponse | null> => {
    if (amountPaidNow <= 0) return null;

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error('Payment gateway failed to load. Please try again.');
    }

    const paymentOrder = await createRazorpayOrder({
      amount: amountPaidNow,
      receipt: `advik_${Date.now()}`,
      notes: {
        paymentMethod: form.paymentMethod,
        customerPhone: formatIndianPhone(form.phone),
      },
    });

    return new Promise((resolve, reject) => {
      const RazorpayCheckout = window.Razorpay;

      if (!RazorpayCheckout) {
        reject(new Error('Payment gateway failed to load. Please try again.'));
        return;
      }

      const checkout = new RazorpayCheckout({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Advik Creations',
        description:
          form.paymentMethod === 'partial_cod'
            ? `Partial COD advance of Rs. ${amountPaidNow}`
            : `Prepaid order payment of Rs. ${amountPaidNow}`,
        order_id: paymentOrder.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: normalizeIndianPhone(form.phone),
        },
        theme: {
          color: '#dc2626',
        },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled.')),
        },
      });

      checkout.open();
    });
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

  const handleGoogleSignIn = async () => {
    if (!isFirebasePhoneAuthConfigured()) {
      setLoginError('Google sign in is not configured yet. Please add Firebase environment values.');
      return;
    }

    setLoginError('');
    setGoogleLoading(true);
    try {
      const credential = await signInWithGoogle();
      const email = credential.user.email;

      if (!email) {
        setLoginError('This Google account does not have an email address.');
        return;
      }

      const token = await credential.user.getIdToken();
      login(email, token, {
        name: credential.user.displayName,
        photoURL: credential.user.photoURL,
      });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Google sign in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
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
    if (form.paymentMethod === 'cod' && !codEnabled) {
      setForm((prev) => ({ ...prev, paymentMethod: partialCodEnabled ? 'partial_cod' : 'prepaid' }));
      return;
    }
    if (form.paymentMethod === 'partial_cod' && !partialCodEnabled) {
      setForm((prev) => ({ ...prev, paymentMethod: 'prepaid' }));
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const phone = normalizeIndianPhone(form.phone);
      const payment = await collectOnlinePayment();

      if (payment) {
        await verifyRazorpayPayment(payment);
      }

      const order = await createOrder({
        customerName: form.fullName.trim(),
        customerEmail: form.email.trim().toLowerCase(),
        customerPhone: formatIndianPhone(phone),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
        })),
        total: finalTotal,
        paymentMethod: form.paymentMethod,
        amountPaid: amountPaidNow,
        amountDue: amountDueOnDelivery,
        paymentStatus:
          form.paymentMethod === 'prepaid'
            ? 'paid'
            : form.paymentMethod === 'partial_cod'
              ? 'partially_paid'
              : 'pending',
        paymentGateway: payment ? 'razorpay' : undefined,
        paymentId: payment?.razorpay_payment_id,
        paymentOrderId: payment?.razorpay_order_id,
        shippingAddress: {
          street: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.pincode.trim(),
          country: 'India',
        },
        orderNotes: form.orderNotes.trim(),
      });
      setPlacedOrderNumber(order.orderNumber);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to continue</h2>
            <p className="text-gray-600 mb-6">Use Google for quick sign in, or verify your mobile number with an SMS code.</p>

            {!otpSent ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-70"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-red-600 ring-1 ring-gray-200">
                    G
                  </span>
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

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
          <p className="text-gray-600 mb-2">Thank you for your order. We&apos;ll send you a confirmation email shortly.</p>
          {placedOrderNumber && (
            <p className="mb-6 text-sm font-semibold text-gray-900">Order number: {placedOrderNumber}</p>
          )}
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
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-red-600 has-[:checked]:bg-red-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethod('prepaid')}
                  className="mt-1 w-4 h-4 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Prepaid</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Extra {prepaidDiscountPercent}% off
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Pay full amount online by UPI, card, net banking or wallet.</p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-4 border rounded-lg has-[:checked]:border-red-600 has-[:checked]:bg-red-50 ${
                  partialCodEnabled ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60 bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'partial_cod'}
                  onChange={() => partialCodEnabled && setPaymentMethod('partial_cod')}
                  disabled={!partialCodEnabled}
                  className="mt-1 w-4 h-4 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Partial COD</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Pay Rs. {advanceAmount.toLocaleString()} now to confirm. Pay Rs. {amountDueOnDelivery.toLocaleString()} on delivery.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-4 border rounded-lg has-[:checked]:border-red-600 has-[:checked]:bg-red-50 ${
                  codEnabled ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60 bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={() => codEnabled && setPaymentMethod('cod')}
                  disabled={!codEnabled}
                  className="mt-1 w-4 h-4 text-red-600"
                />
                <div>
                  <span className="font-medium">Full COD</span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {codEnabled ? 'Pay the full order amount when you receive it.' : 'Currently not available'}
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
                  <span>Prepaid – {prepaidDiscountPercent}% extra off</span>
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
              {amountPaidNow > 0 && (
                <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-green-700">
                  <span className="font-medium">Pay now</span>
                  <span className="font-semibold">Rs. {amountPaidNow.toLocaleString()}</span>
                </div>
              )}
              {amountDueOnDelivery > 0 && (
                <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-gray-700">
                  <span className="font-medium">Pay on delivery</span>
                  <span className="font-semibold">Rs. {amountDueOnDelivery.toLocaleString()}</span>
                </div>
              )}
            {(quantityDiscountAmount > 0 || prepaidDiscountAmount > 0) && (
                <p className="text-xs text-gray-500 mt-1">
                  You save Rs. {(quantityDiscountAmount + prepaidDiscountAmount).toLocaleString()}
                </p>
              )}
            </div>
            {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? amountPaidNow > 0
                  ? 'Opening payment...'
                  : 'Placing order...'
                : amountPaidNow > 0
                  ? `Pay Rs. ${amountPaidNow.toLocaleString()} & Place Order`
                  : 'Place COD Order'}
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
