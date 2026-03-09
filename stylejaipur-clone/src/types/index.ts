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
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}


