import type { Product } from '../types';
import fetchApi from './client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload/image`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function uploadProductImages(files: File[]): Promise<{ urls: string[] }> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  const res = await fetch(`${API_BASE}/upload/images`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function uploadProductVideo(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('video', file);
  const res = await fetch(`${API_BASE}/upload/video`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function uploadProductMedia(file: File): Promise<{ url: string; mediaType: 'image' | 'video' }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/banner`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function getProducts(): Promise<Product[]> {
  const list = await fetchApi<Product[] | { id: string }[]>('/products');
  return (list as Product[]).map((p) => ({
    ...p,
    stockQuantity: (p as Product & { stockQuantity?: number }).stockQuantity ?? 0,
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/${id}`);
  } catch {
    return null;
  }
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const payload = {
    ...data,
    sizes: data.sizes || ['M-38', 'L-40', 'XL-42'],
    stockQuantity: data.stockQuantity ?? 0,
  };
  return fetchApi<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return fetchApi<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchApi(`/products/${id}`, { method: 'DELETE' });
}
