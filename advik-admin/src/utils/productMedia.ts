import type { Product } from '../types';

export const getPrimaryProductImage = (product: Pick<Product, 'generatedModelImage' | 'image'>) =>
  product.generatedModelImage || product.image;
