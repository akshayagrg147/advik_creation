import type { Product } from '../types';

export function getProductPrice(product: Product, size?: string): number {
  if (!product) return 0;
  if (size && product.priceBySize?.[size] != null) {
    return product.priceBySize[size];
  }
  return product.price;
}
