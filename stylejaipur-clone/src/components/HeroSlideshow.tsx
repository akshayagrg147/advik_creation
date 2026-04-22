import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getProductPrice } from '../utils/price';

interface Slide {
  id: number | string;
  image?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  overlayOpacity?: number;
  overlayColor?: string;
}

interface HeroSlideshowProps {
  slides: Slide[];
  featuredProducts?: Product[];
  autoPlayInterval?: number;
}

const getHeroProductScore = (product: Product) => {
  const image = product.image.toLowerCase();
  const name = product.name.toLowerCase();
  const subcategory = product.subcategory?.toLowerCase() || '';
  let score = 0;

  if ((product.images?.length || 0) > 1) score += 8;
  if (product.rating || product.reviews) score += 5;
  if (product.discount || product.originalPrice) score += 3;
  if (product.bestSeller) score += 3;
  if (image.includes('stylejaipur.com') || image.includes('cdn/shop/files')) score += 3;
  if (image.includes('dsc_')) score += 2;
  if (product.unstitchedCollection || subcategory.includes('unstitched') || subcategory.includes('fabric')) score -= 6;
  if (name.includes('summer cool')) score -= 8;
  if (!product.rating && !product.reviews && !product.discount) score -= 3;

  return score;
};

const HeroSlideshow = ({ slides, featuredProducts = [], autoPlayInterval = 5000 }: HeroSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const height = sectionRef.current.offsetHeight;
      if (rect.top < height) {
        const move = (height - rect.top) * 0.05;
        setParallaxY(Math.min(move, height * 0.08));
      } else {
        setParallaxY(0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const heroProducts = featuredProducts
    .map((product, index) => ({ product, index, score: getHeroProductScore(product) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map(({ product }) => product);
  const featuredProduct = heroProducts[0];
  const heroTitle = 'Advik Creations';
  const heroSubtitle =
    currentSlide?.subtitle || 'Festive ethnicwear, crafted for modern celebrations.';
  const heroButtonText = currentSlide?.buttonText || 'Shop New Arrivals';
  const heroButtonLink = currentSlide?.buttonLink || '/new-arrivals';

  return (
    <section
      ref={sectionRef}
      className="hero-3d relative min-h-[690px] overflow-hidden bg-[#111827] md:min-h-[600px]"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 preserve-3d">
        <img
          src="/images/advik-hero-editorial.png"
          alt="Advik Creations festive collection"
          className="hero-slide-layer h-full w-full object-cover object-[64%_center] md:object-center"
          style={{ transform: `translate3d(0, ${-parallaxY}px, 0) scale(1.05)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-gray-950/8 md:via-gray-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/55 via-transparent to-transparent" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_18%_80%,rgba(220,38,38,0.22),transparent_28%)]" />

      <div
        className="container mx-auto absolute inset-0 z-10 flex flex-col justify-center gap-8 overflow-hidden px-4 py-7 md:grid md:grid-cols-[0.92fr_1.08fr] md:items-center lg:px-8"
        style={{ transform: 'translateZ(40px)', perspective: '1400px' }}
      >
        <div className="w-[calc(100vw-2rem)] max-w-none text-white pointer-events-auto md:w-full md:max-w-xl">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur sm:text-xs sm:tracking-[0.22em]">
            Limited festive edit
          </div>
          <h1 className="max-w-[11ch] text-4xl font-semibold leading-[0.98] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-[28rem] text-base leading-7 text-white/84 md:text-lg">
            {heroSubtitle}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Link
              to={heroButtonLink}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:px-6"
            >
              {heroButtonText}
            </Link>
            <Link
              to="/best-sellers"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:px-6"
            >
              Best Sellers
            </Link>
          </div>
          <div className="mt-7 grid w-[calc(100vw-2rem)] max-w-none grid-cols-2 gap-3 text-white sm:grid-cols-3 md:w-full md:max-w-lg">
            {[
              ['4.7/5', 'Customer rating'],
              ['11+', 'Curated styles'],
              ['COD', 'Available'],
            ].map(([value, label], index) => (
              <div key={label} className={`min-w-0 rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur ${index === 2 ? 'hidden sm:block' : ''}`}>
                <div className="text-2xl font-semibold sm:text-xl">{value}</div>
                <div className="mt-1 truncate text-[10px] uppercase tracking-wide text-white/65 sm:text-[11px]">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 hidden w-[calc(100vw-2rem)] grid-cols-2 gap-2 sm:grid md:hidden">
            {heroProducts.slice(0, 2).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="min-w-0 h-36 overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-xl shadow-black/25"
              >
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </Link>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[520px] md:block">
          {featuredProduct && (
            <Link
              to={`/product/${featuredProduct.id}`}
              className="absolute bottom-8 right-0 w-80 rounded-lg border border-white/20 bg-white/95 p-3 text-gray-950 shadow-2xl shadow-black/30 backdrop-blur transition hover:-translate-y-1"
            >
              <div className="flex gap-3">
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  className="h-20 w-16 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">Editor pick</div>
                  <div className="line-clamp-2 text-sm font-semibold leading-5">{featuredProduct.name}</div>
                  <div className="mt-2 text-sm font-bold">Rs. {getProductPrice(featuredProduct, featuredProduct.sizes[0]).toLocaleString()}</div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 md:block"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 md:block"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-white w-8 h-2'
                  : 'bg-white/50 w-2 h-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
          />
        </div>
      )}
    </section>
  );
};

export default HeroSlideshow;
