import { useEffect } from 'react';

interface AddToCartToastProps {
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function AddToCartToast({ isVisible, onClose, duration = 2500 }: AddToCartToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-toast-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-lg shadow-black/25 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 animate-toast-check">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-wide">Product added to cart!</span>
      </div>
    </div>
  );
}
