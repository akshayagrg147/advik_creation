import { Link } from 'react-router-dom';
import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const ProductList = ({ products, title, showViewAll = false, viewAllLink }: ProductListProps) => {
  if (products.length === 0) {
    return null;
  }

  const normalizedTitle = title?.toLowerCase() || '';
  const isBestSeller = normalizedTitle.includes('best seller');
  const eyebrow = isBestSeller ? 'Most loved styles' : 'Fresh from the studio';
  const heading = isBestSeller ? 'Best Sellers' : title;
  const subcopy = isBestSeller
    ? 'Top-rated styles with the strongest customer love, best discounts, and quickest repeat orders.'
    : undefined;

  return (
    <section className={`section-3d py-14 md:py-16 ${isBestSeller ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        {title && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">{eyebrow}</p>
              <h2 className="text-3xl font-semibold text-gray-950 md:text-4xl">{heading}</h2>
              {subcopy && <p className="mt-2 hidden text-sm text-gray-500 sm:block">{subcopy}</p>}
            </div>
            {showViewAll && viewAllLink && (
              <Link
                to={viewAllLink}
                className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                View all →
              </Link>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              <ProductCard product={product} variant={isBestSeller ? 'premium' : 'default'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
