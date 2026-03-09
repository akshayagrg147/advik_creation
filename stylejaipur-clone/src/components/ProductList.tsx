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

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            {showViewAll && viewAllLink && (
              <a
                href={viewAllLink}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                View all →
              </a>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductList;

