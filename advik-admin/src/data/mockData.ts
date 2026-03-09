import type { Product, Order, User, Category, Story } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Black Printed Cotton Kurta and Pant Set with Dupatta',
    description: 'Beautiful black printed cotton kurta set with matching pant and dupatta',
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=800',
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Kurta Set',
    rating: 4.5,
    reviews: 120,
    inStock: true,
    stockQuantity: 50,
    newArrival: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Desert Sand Embroidered Roam Silk Suit Set with Dupatta',
    description: 'Elegant desert sand embroidered roam silk suit set',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=800',
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.6,
    reviews: 85,
    inStock: true,
    stockQuantity: 30,
    newArrival: true,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-21',
  },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      {
        productId: '1',
        productName: 'Black Printed Cotton Kurta and Pant Set',
        size: 'L-40',
        quantity: 2,
        price: 1199,
      },
    ],
    total: 2398,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '123 Main St',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302001',
      country: 'India',
    },
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'customer',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-01-20',
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: "Women's Wear",
    slug: 'womens-wear',
    description: 'Women fashion collection',
    subcategories: [
      { id: '1', name: 'Kurta Set', slug: 'kurta-set' },
      { id: '2', name: 'Suit Set', slug: 'suit-set' },
      { id: '3', name: 'Co-Ord Set', slug: 'co-ord-set' },
    ],
    createdAt: '2024-01-01',
  },
];

export const mockStories: Story[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Black Printed Cotton Kurta and Pant Set with Dupatta',
    productImage: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=800',
    category: 'New Arrivals',
    order: 1,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Desert Sand Embroidered Roam Silk Suit Set with Dupatta',
    productImage: 'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=800',
    category: 'New Arrivals',
    order: 2,
    isActive: true,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-21',
  },
  {
    id: '3',
    productId: '1',
    productName: 'Black Printed Cotton Kurta and Pant Set with Dupatta',
    productImage: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=800',
    category: 'Kurta Sets',
    order: 1,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '4',
    productId: '2',
    productName: 'Desert Sand Embroidered Roam Silk Suit Set with Dupatta',
    productImage: 'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=800',
    category: 'Co-Ords',
    order: 1,
    isActive: true,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-21',
  },
];

