import { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import ProductStoryModal from '../components/ProductStoryModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import HeroSlideshow from '../components/HeroSlideshow';
import AnimatedSection from '../components/AnimatedSection';
import {
  getNewArrivals,
  getBestSellers,
  getUnstitchedCollections,
  getProductsForFindYourFit,
  getHeroSlides,
  getReviews,
  getFindYourFitCategories,
  getStoriesByCategory,
} from '../api';
import type { Product } from '../types';
import type { HeroSlide, StoryItem } from '../api';

const Home = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [unstitchedCollections, setUnstitchedCollections] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [reviews, setReviews] = useState<{ name: string; review: string; product: string; date: string; image: string }[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ rating: 4.7, totalReviews: 2818 });
  const [findYourFitCategories, setFindYourFitCategories] = useState<Array<{
    name: string;
    image: string;
    link: string;
    category: string;
    subcategory?: string;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isEmptyModalOpen, setIsEmptyModalOpen] = useState(false);
  const [emptyCategoryName, setEmptyCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedStoryItems, setSelectedStoryItems] = useState<StoryItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loadingStoryProducts, setLoadingStoryProducts] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [newArrivalsData, bestSellersData, unstitchedData, heroSlidesData, reviewsData, categoriesData] =
          await Promise.all([
            getNewArrivals(),
            getBestSellers(),
            getUnstitchedCollections(),
            getHeroSlides(),
            getReviews(),
            getFindYourFitCategories(),
          ]);
        setNewArrivals(newArrivalsData);
        setBestSellers(bestSellersData);
        setUnstitchedCollections(unstitchedData);
        setHeroSlides(heroSlidesData);
        setReviews(reviewsData.reviews);
        setReviewSummary(reviewsData.summary);
        setFindYourFitCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleFindYourFitClick = async (
    e: React.MouseEvent,
    category: string,
    subcategory?: string,
    link: string = '/'
  ) => {
    e.preventDefault();
    try {
      setLoadingStoryProducts(true);
      const stories = await getStoriesByCategory(category);
      if (stories.length > 0) {
        setSelectedCategory(category);
        setSelectedStoryItems(stories);
        setSelectedProducts([]);
        setInitialIndex(0);
        setIsStoryModalOpen(true);
      } else {
        setEmptyCategoryName(category);
        setIsEmptyModalOpen(true);
      }
    } catch (err) {
      console.error('Find Your Fit error:', err);
      window.location.href = link;
    } finally {
      setLoadingStoryProducts(false);
    }
  };

  const coOrdProducts = bestSellers.filter((p) => p.subcategory === 'Co-Ord Set');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-3d">
      {/* Hero Banner Slideshow – parallax + 3D depth */}
      <HeroSlideshow slides={heroSlides} autoPlayInterval={5000} />

      {/* Find Your Fit Section */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              FIND YOUR FIT
            </h2>
            {/* Single horizontal row, scrollable on mobile */}
            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
              {findYourFitCategories.map((item, index) => (
                <AnimatedSection
                  key={index}
                  animationType="scale"
                  delay={index * 100}
                  className="flex flex-col items-center shrink-0"
                >
                  <button
                    onClick={(e) =>
                      handleFindYourFitClick(e, item.category, item.subcategory, item.link)
                    }
                    disabled={loadingStoryProducts}
                    className="flex flex-col items-center group cursor-pointer disabled:opacity-70"
                  >
                    <div
                      className="tilt-3d-hover w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-900 shadow-lg hover:shadow-xl mb-3 animate-float"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                      {item.name}
                    </span>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* New Arrivals */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <ProductList
          products={newArrivals}
          title="NEW ARRIVAL"
          showViewAll
          viewAllLink="/new-arrivals"
        />
      </AnimatedSection>

      {/* Watch and Shop Section */}
      <AnimatedSection animationType="scale" delay={150}>
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">WATCH AND SHOP</h2>
            <div className="max-w-4xl mx-auto section-3d">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <img
                  src="https://stylejaipur.com/cdn/shop/files/style_jaipur_banner.png?v=1719834320"
                  alt="Watch and Shop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Best Sellers */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <ProductList
          products={bestSellers}
          title="BEST SELLER"
          showViewAll
          viewAllLink="/best-sellers"
        />
      </AnimatedSection>

      {/* Unstitched Collections */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <ProductList
          products={unstitchedCollections}
          title="UNSTITCHED COLLECTIONS"
          showViewAll
          viewAllLink="/unstitched-collections"
        />
      </AnimatedSection>

      {/* Empty / Not Available Modal */}
      {isEmptyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Not Available</h3>
            <p className="text-gray-600 mb-6">
              No stories or reels available for <strong>{emptyCategoryName}</strong> at the moment.
            </p>
            <button
              onClick={() => setIsEmptyModalOpen(false)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Product Story Modal - only mount when open to avoid init issues */}
      {isStoryModalOpen && (
        <ErrorBoundary>
          <ProductStoryModal
            isOpen={true}
            onClose={() => setIsStoryModalOpen(false)}
            category={selectedCategory}
            products={selectedProducts}
            storyItems={selectedStoryItems}
            initialIndex={initialIndex}
          />
        </ErrorBoundary>
      )}

      {/* Co-Ord Sets Section */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <ProductList
          products={coOrdProducts}
          title="Co-Ord SETS"
          showViewAll
          viewAllLink="/womens-wear/co-ord-set"
        />
      </AnimatedSection>

      {/* Customer Reviews Section */}
      <AnimatedSection animationType="fade-up" delay={100}>
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Let customers speak for us
            </h2>
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-4xl animate-float">⭐</span>
                <span className="text-2xl font-bold">{reviewSummary.rating}</span>
              </div>
              <p className="text-gray-600">from {reviewSummary.totalReviews} reviews</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <AnimatedSection
                  key={index}
                  animationType="fade-up"
                  delay={index * 150}
                >
                  <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <img
                      src={review.image}
                      alt={review.product}
                      className="w-full h-48 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-semibold">{review.name}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.review}</p>
                    <p className="text-sm text-gray-500 mb-1">{review.product}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default Home;
