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
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  unstitchedCollection?: boolean;
  generatedModelImage?: string;
  generatedModelPrompt?: string;
  generatedModelStatus?: 'idle' | 'generating' | 'ready' | 'failed';
  generatedModelError?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  price: number;
}

export interface OrderAddress {
  street?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded';
  paymentMethod?: 'prepaid' | 'partial_cod' | 'cod';
  amountPaid?: number;
  amountDue?: number;
  paymentGateway?: string;
  paymentId?: string;
  paymentOrderId?: string;
  shippingAddress: OrderAddress;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}
