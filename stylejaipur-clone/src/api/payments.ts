import fetchApi from './client';

export type PaymentOrder = {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type PaymentVerificationInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export const createRazorpayOrder = (data: {
  amount: number;
  receipt?: string;
  notes?: Record<string, string>;
}) =>
  fetchApi<PaymentOrder>('/payments/razorpay/order', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyRazorpayPayment = (data: PaymentVerificationInput) =>
  fetchApi<{ verified: boolean }>('/payments/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
