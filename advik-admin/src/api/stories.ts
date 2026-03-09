const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface Story {
  id: string;
  category: string;
  order: number;
  type: 'product' | 'reel' | 'media';
  productId?: string;
  productName?: string;
  productImage?: string;
  productVideo?: string;
  productPrice?: number;
  productLink?: string;
  product?: unknown;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  title?: string;
  link?: string;
  isActive?: boolean;
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

export async function getStories(category?: string): Promise<Story[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : '';
  return fetchApi<Story[]>(`/banners/stories${q}`);
}

export async function createStory(data: Partial<Story>): Promise<Story> {
  return fetchApi<Story>('/banners/stories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStory(id: string, data: Partial<Story>): Promise<Story> {
  return fetchApi<Story>(`/banners/stories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteStory(id: string): Promise<void> {
  await fetchApi(`/banners/stories/${id}`, { method: 'DELETE' });
}

export async function uploadStoryMedia(file: File): Promise<{ url: string; mediaType: 'image' | 'video' }> {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE}/upload/banner`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}
