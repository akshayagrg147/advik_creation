import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

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
  autoPlayInterval?: number;
}

const HeroSlideshow = ({ slides, autoPlayInterval = 5000 }: HeroSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const height = sectionRef.current.offsetHeight;
      if (rect.top < height) {
        const move = (height - rect.top) * 0.15;
        setParallaxY(Math.min(move, height * 0.2));
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

  // GSAP: animate hero content when slide changes
  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;

    const from = { y: 32, opacity: 0 };
    const to = { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' };

    const tl = gsap.timeline();
    if (title) tl.fromTo(title, from, { ...to, duration: 0.6 }, 0);
    if (subtitle) tl.fromTo(subtitle, from, { ...to, duration: 0.6, delay: 0.15 }, 0);
    if (cta) tl.fromTo(cta, from, { ...to, duration: 0.5, delay: 0.3 }, 0);

    return () => tl.kill();
  }, [currentIndex]);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);

  if (slides.length === 0) return null;

  const mediaUrl = (s: Slide) => s.mediaUrl || s.image || '';
  const isVideo = (s: Slide) => s.mediaType === 'video';
  const currentSlide = slides[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="hero-3d relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full preserve-3d">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 hero-slide-layer"
              style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.05)` }}
            >
              {isVideo(slide) ? (
                <video
                  src={mediaUrl(slide)}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={mediaUrl(slide)}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  slide.overlayColor || 'from-red-900/80 to-red-800/80'
                }`}
                style={{
                  opacity: slide.overlayOpacity ?? 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Single content block for current slide – GSAP animates these refs; slight translateZ for 3D pop */}
      <div
        className="container mx-auto px-4 absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ transform: 'translateZ(40px)', perspective: '1400px' }}
      >
        <div className="text-center text-white pointer-events-auto">
          {currentSlide?.title && (
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              {currentSlide.title}
            </h1>
          )}
          {currentSlide?.subtitle && (
            <p ref={subtitleRef} className="text-xl md:text-2xl mb-8">
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide?.buttonText && currentSlide?.buttonLink && (
            <Link
              ref={ctaRef}
              to={currentSlide.buttonLink}
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              {currentSlide.buttonText}
            </Link>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm"
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
