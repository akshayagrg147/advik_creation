const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface DashboardStats {
  totalProducts: number;
  newArrivals: number;
  bestSellers: number;
  unstitchedCollections: number;
  totalReviews: number;
  totalStories: number;
  totalHeroSlides: number;
  totalRevenue: number;
  totalOrders: number;
  reviewSummary: { rating: number; totalReviews: number };
  recentProducts: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    region: string;
    createdAt: string;
  }>;
  ordersByRegion: Array<{ region: string; orders: number; revenue: number }>;
  chartData: Array<{ name: string; products: number; month: number }>;
  revenueChartData: Array<{ name: string; revenue: number; orders: number }>;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/dashboard/stats');
}
