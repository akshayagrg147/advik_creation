/**
 * Banners API - Fetches from backend
 */

import fetchApi from './client';

export interface HeroSlide {
  id: number | string;
  image?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  overlayOpacity?: number;
  overlayColor?: string;
}

export interface Review {
  name: string;
  review: string;
  product: string;
  date: string;
  image: string;
}

export interface FindYourFitCategory {
  name: string;
  image: string;
  link: string;
  category: string;
  subcategory?: string;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const slides = await fetchApi<HeroSlide[]>('/banners/hero-slides');
  return slides.map((s, i) => ({
    ...s,
    id: (s as { id?: number | string }).id ?? i,
    image: (s as { image?: string }).image ?? (s as { mediaUrl?: string }).mediaUrl,
  }));
}

export async function getOffers(): Promise<string[]> {
  return fetchApi<string[]>('/banners/offers');
}

export async function getReviews(): Promise<{
  reviews: Review[];
  summary: { rating: number; totalReviews: number };
}> {
  return fetchApi<{ reviews: Review[]; summary: { rating: number; totalReviews: number } }>(
    '/banners/reviews'
  );
}

export async function getFindYourFitCategories(): Promise<FindYourFitCategory[]> {
  return fetchApi<FindYourFitCategory[]>('/banners/find-your-fit');
}

export interface StoryItem {
  id: string;
  type: 'product' | 'reel' | 'media';
  product?: {
    id: string;
    name: string;
    image: string;
    video?: string;
    price: number;
    originalPrice?: number;
    sizes: string[];
  };
  productImage?: string;
  productName?: string;
  productPrice?: number;
  productLink?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  title?: string;
  link?: string;
}

export async function getStoriesByCategory(category: string): Promise<StoryItem[]> {
  return fetchApi<StoryItem[]>(`/banners/stories/by-category/${encodeURIComponent(category)}`);
}
