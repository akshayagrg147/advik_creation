/**
 * Products API - Fetches from backend
 */

import type { Product } from '../types';
import fetchApi from './client';

export async function getProducts(): Promise<Product[]> {
  return fetchApi<Product[]>('/products');
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/${id}`);
  } catch {
    return null;
  }
}

export async function getNewArrivals(): Promise<Product[]> {
  return fetchApi<Product[]>('/products/new-arrivals');
}

export async function getBestSellers(): Promise<Product[]> {
  return fetchApi<Product[]>('/products/best-sellers');
}

export async function getUnstitchedCollections(): Promise<Product[]> {
  return fetchApi<Product[]>('/products/unstitched-collections');
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const slug = category.replace(/\s+/g, '-').toLowerCase();
  return fetchApi<Product[]>(`/products/category/${encodeURIComponent(slug)}`);
}

export async function getProductsBySubcategory(subcategory: string): Promise<Product[]> {
  const slug = subcategory.replace(/\s+/g, '-').toLowerCase();
  return fetchApi<Product[]>(`/products/subcategory/${encodeURIComponent(slug)}`);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  return fetchApi<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
}

export async function getProductsForFindYourFit(
  category: string,
  subcategory?: string
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (subcategory) params.set('subcategory', subcategory);
  return fetchApi<Product[]>(`/products/find-your-fit?${params}`);
}
