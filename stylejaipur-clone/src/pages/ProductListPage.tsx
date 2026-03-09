import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import AnimatedSection from '../components/AnimatedSection';
import {
  getNewArrivals,
  getBestSellers,
  getUnstitchedCollections,
  getProductsByCategory,
  getProductsBySubcategory,
  getProducts,
} from '../api';
import type { Product } from '../types';

const ProductListPage = () => {
  const { category, subcategory } = useParams<{ category?: string; subcategory?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [pageTitle, setPageTitle] = useState('All Products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (category === 'new-arrivals') {
          const data = await getNewArrivals();
          setProducts(data);
          setPageTitle('New Arrivals');
        } else if (category === 'best-sellers') {
          const data = await getBestSellers();
          setProducts(data);
          setPageTitle('Best Sellers');
        } else if (category === 'unstitched-collections') {
          const data = await getUnstitchedCollections();
          setProducts(data);
          setPageTitle('Unstitched Collections');
        } else if (category != null && subcategory != null) {
          const subcategoryName = subcategory
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          const data = await getProductsBySubcategory(subcategoryName);
          setProducts(data);
          setPageTitle(subcategoryName);
        } else if (category != null) {
          const categoryName = category
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          const data = await getProductsByCategory(categoryName);
          setProducts(data);
          setPageTitle(categoryName);
        } else {
          const data = await getProducts();
          setProducts(data);
          setPageTitle('All Products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="h-10 w-64 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <AnimatedSection animationType="fade-up" delay={0}>
            <h1 className="text-4xl font-bold text-gray-800">{pageTitle}</h1>
          </AnimatedSection>
        </div>
      </div>
      <AnimatedSection animationType="fade-up" delay={100}>
        <ProductList products={products} />
      </AnimatedSection>
    </div>
  );
};

export default ProductListPage;
