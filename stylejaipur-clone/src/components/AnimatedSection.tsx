import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  animationType?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale';
}

const fromToMap = {
  'fade-up': { y: 48, opacity: 0 },
  'fade-in': { opacity: 0 },
  'slide-left': { x: -48, opacity: 0 },
  'slide-right': { x: 48, opacity: 0 },
  scale: { scale: 0.92, opacity: 0 },
};

const toMap = {
  'fade-up': { y: 0, opacity: 1 },
  'fade-in': { opacity: 1 },
  'slide-left': { x: 0, opacity: 1 },
  'slide-right': { x: 0, opacity: 1 },
  scale: { scale: 1, opacity: 1 },
};

const AnimatedSection = ({
  children,
  delay = 0,
  className = '',
  animationType = 'fade-up',
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars = fromToMap[animationType];
    const toVars = {
      ...toMap[animationType],
      duration: 0.8,
      ease: 'power3.out',
      delay: delay / 1000,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play none none none',
      },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(el, fromVars, toVars);
    });

    return () => ctx.revert();
  }, [animationType, delay]);

  return <div ref={ref} className={className}>{children}</div>;
};

export default AnimatedSection;
