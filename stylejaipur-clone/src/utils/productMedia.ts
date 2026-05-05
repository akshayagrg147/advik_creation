import type { Product } from '../types';

export const getPrimaryProductImage = (
  product: Pick<Product, 'generatedModelImage' | 'image'>
) => product.generatedModelImage || product.image;

export const getProductGallery = (
  product: Pick<Product, 'generatedModelImage' | 'image' | 'images'>
) => {
  const ordered = [product.generatedModelImage, product.image, ...(product.images || [])].filter(Boolean);
  return Array.from(new Set(ordered));
};
