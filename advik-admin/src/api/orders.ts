import type { Order } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

export async function getOrders(status?: string): Promise<Order[]> {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  return fetchApi<Order[]>(`/orders${query}`);
}

export async function getOrderById(id: string): Promise<Order> {
  return fetchApi<Order>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  return fetchApi<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
