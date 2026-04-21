import fetchApi from './client';
import type { Order } from '../types';

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: 'prepaid' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderNotes?: string;
};

export const createOrder = (order: CreateOrderInput) =>
  fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });

export const getCustomerOrders = (contact: { phone?: string; email?: string }) => {
  const params = new URLSearchParams();

  if (contact.phone) params.set('phone', contact.phone);
  if (contact.email) params.set('email', contact.email);

  return fetchApi<Order[]>(`/orders/customer?${params.toString()}`);
};
