const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface Review {
  id: string;
  name: string;
  review: string;
  product?: string;
  date?: string;
  image?: string;
  rating?: number;
}

export interface ReviewSummary {
  rating: number;
  totalReviews: number;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

export async function getReviews(): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  return fetchApi<{ reviews: Review[]; summary: ReviewSummary }>('/banners/reviews');
}

export async function getReviewSummary(): Promise<ReviewSummary> {
  return fetchApi<ReviewSummary>('/banners/reviews/summary');
}

export async function createReview(data: Partial<Review>): Promise<Review> {
  return fetchApi<Review>('/banners/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReview(id: string, data: Partial<Review>): Promise<Review> {
  return fetchApi<Review>(`/banners/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await fetchApi(`/banners/reviews/${id}`, { method: 'DELETE' });
}

export async function updateReviewSummary(data: Partial<ReviewSummary>): Promise<ReviewSummary> {
  return fetchApi<ReviewSummary>('/banners/reviews/summary', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
