import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import ProductStoryModal from '../components/ProductStoryModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import HeroSlideshow from '../components/HeroSlideshow';
import AnimatedSection from '../components/AnimatedSection';
import {
  getNewArrivals,
  getBestSellers,
  getUnstitchedCollections,
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
  const [isCampaignVideoOpen, setIsCampaignVideoOpen] = useState(false);
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
  const watchProducts = [...newArrivals, ...bestSellers].slice(0, 3);

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
      <HeroSlideshow
        slides={heroSlides}
        featuredProducts={[...newArrivals, ...bestSellers]}
        autoPlayInterval={8000}
      />

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-gray-200 px-4 py-px sm:grid-cols-2 md:grid-cols-4">
          {[
            ['COD Available', 'Pay when your order arrives'],
            ['Fresh Drops', 'New looks added often'],
            ['Size Choices', 'Multiple fits on key styles'],
            ['Secure Checkout', 'Fast and simple ordering'],
          ].map(([title, copy]) => (
            <div key={title} className="bg-white px-3 py-5 text-center">
              <p className="text-sm font-semibold text-gray-950">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Find Your Fit Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">Shop by mood</p>
            <h2 className="text-3xl font-semibold text-gray-950 md:text-4xl">Find Your Fit</h2>
          </div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:justify-center md:gap-6 md:px-0">
            {findYourFitCategories.map((item, index) => (
              <button
                key={index}
                onClick={(e) =>
                  handleFindYourFitClick(e, item.category, item.link)
                }
                disabled={loadingStoryProducts}
                className="flex shrink-0 cursor-pointer flex-col items-center group disabled:opacity-70"
              >
                <div
                  className="tilt-3d-hover relative mb-3 h-28 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 via-white to-emerald-50 shadow-sm transition group-hover:shadow-xl sm:h-32 sm:w-32 md:h-36 md:w-36"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-red-600 md:text-base">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

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
        <section id="watch-and-shop" className="overflow-hidden bg-gray-950 py-16 text-white md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-300">Styled in motion</p>
                <h2 className="text-3xl font-semibold md:text-4xl">Watch and Shop</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                  A premium campaign preview with ready-to-shop looks from the latest Advik edit.
                </p>
              </div>
              <Link
                to="/new-arrivals"
                className="inline-flex w-fit items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore looks
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
              <button
                type="button"
                onClick={() => setIsCampaignVideoOpen(true)}
                className="group relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl shadow-black/30 md:min-h-[520px]"
                aria-label="Play Advik Creation campaign film"
              >
                <video
                  src="/videos/watch-shop-campaign.webm"
                  poster="/images/watch-shop-premium.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover object-[62%_center] transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/78 via-gray-950/28 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/82 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
                  Campaign film
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-2xl backdrop-blur transition group-hover:scale-105">
                    <span className="ml-1 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-white" />
                  </span>
                </div>
                <div className="absolute bottom-6 left-5 max-w-md text-left">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-200">New season story</p>
                  <h3 className="text-3xl font-semibold leading-tight md:text-5xl">Festive silhouettes, styled to move.</h3>
                </div>
              </button>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 sm:col-span-3 lg:col-span-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-200">Featured edit</p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight text-white">Shop the campaign looks</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Premium styles picked from the latest drop, ready to add straight from the film.
                  </p>
                </div>
                {watchProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-20 shrink-0 rounded-md object-cover object-top"
                    />
                    <div className="min-w-0 py-1">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-200">Shop the look</p>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{product.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-white/90">Rs. {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
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

      {isCampaignVideoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/90 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close campaign film"
            onClick={() => setIsCampaignVideoOpen(false)}
          />
          <div className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-gray-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCampaignVideoOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-white hover:text-gray-950"
              aria-label="Close campaign film"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video
              src="/videos/watch-shop-campaign.webm"
              poster="/images/watch-shop-premium.png"
              controls
              autoPlay
              muted
              playsInline
              className="aspect-video w-full bg-black object-cover"
            />
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
        <section className="bg-white py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">Loved by shoppers</p>
              <h2 className="text-3xl font-semibold text-gray-950 md:text-4xl">Let customers speak for us</h2>
            </div>
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
                  <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <img
                      src={review.image}
                      alt={review.product}
                      className="mb-4 h-48 w-full rounded-md object-cover transition-transform duration-300 hover:scale-[1.02]"
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
