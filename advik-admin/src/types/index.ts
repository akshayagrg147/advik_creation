export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceBySize?: Record<string, number>;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  video?: string;
  sizes: string[];
  category: string;
  subcategory?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  stockQuantity: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  unstitchedCollection?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded';
  paymentMethod?: 'prepaid' | 'partial_cod' | 'cod';
  amountPaid?: number;
  amountDue?: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: Subcategory[];
  createdAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super-admin' | 'admin' | 'manager';
  createdAt: string;
}

export interface Story {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  category: 'New Arrivals' | 'Kurta Sets' | 'Co-Ords' | 'Gowns' | 'Dresses' | "Men's Wear";
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
