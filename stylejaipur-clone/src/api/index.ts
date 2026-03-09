/**
 * API - Customer Frontend
 * Fetches from backend (MongoDB)
 */

export {
  getProducts,
  getProductById,
  getNewArrivals,
  getBestSellers,
  getUnstitchedCollections,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
  getProductsForFindYourFit,
} from './products';

export {
  getHeroSlides,
  getOffers,
  getReviews,
  getFindYourFitCategories,
  getStoriesByCategory,
} from './banners';

export type { HeroSlide, Review, FindYourFitCategory, StoryItem } from './banners';
export { API_BASE } from './client';
