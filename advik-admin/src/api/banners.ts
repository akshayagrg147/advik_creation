const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface HeroSlide {
  id: string;
  order: number;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  image?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  overlayOpacity?: number;
  overlayColor?: string;
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

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const all = await fetchApi<HeroSlide[]>('/banners/hero-slides');
  return all;
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  return fetchApi<HeroSlide[]>('/banners/hero-slides?all=true');
}

export async function createHeroSlide(data: Partial<HeroSlide>): Promise<HeroSlide> {
  const payload = {
    ...data,
    mediaUrl: data.mediaUrl || data.image,
    mediaType: data.mediaType || 'image',
  };
  return fetchApi<HeroSlide>('/banners/hero-slides', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlide>): Promise<HeroSlide> {
  const payload = { ...data, mediaUrl: data.mediaUrl ?? data.image };
  return fetchApi<HeroSlide>(`/banners/hero-slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await fetchApi(`/banners/hero-slides/${id}`, { method: 'DELETE' });
}

export async function uploadBannerMedia(file: File): Promise<{ url: string; mediaType: 'image' | 'video' }> {
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
