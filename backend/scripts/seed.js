import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import HeroSlide from '../src/models/HeroSlide.js';
import Story from '../src/models/Story.js';
import Offer from '../src/models/Offer.js';
import Review from '../src/models/Review.js';
import ReviewSummary from '../src/models/ReviewSummary.js';
import FindYourFitCategory from '../src/models/FindYourFitCategory.js';
import Order from '../src/models/Order.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/advik_ecom';

const products = [
  {
    name: 'Black Printed Cotton Kurta and Pant Set with Dupatta',
    description: 'Beautiful black printed cotton kurta set with matching pant and dupatta',
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=800',
    images: [
      'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=800',
      'https://stylejaipur.com/cdn/shop/files/DSC_2472copy.jpg?v=1767345930&width=800',
    ],
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Kurta Set',
    rating: 4.5,
    reviews: 120,
    inStock: true,
    stockQuantity: 50,
    newArrival: true,
  },
  {
    name: 'Desert Sand Embroidered Roam Silk Suit Set with Dupatta',
    description: 'Elegant desert sand embroidered roam silk suit set',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=800',
    images: [
      'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=800',
      'https://stylejaipur.com/cdn/shop/files/DSC_2430copy.jpg?v=1767345033&width=800',
    ],
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.6,
    reviews: 85,
    inStock: true,
    stockQuantity: 30,
    newArrival: true,
  },
  {
    name: 'Coral Blue Embroidered Roman Silk Suit Set with Dupatta',
    description: 'Stunning coral blue embroidered roman silk suit set',
    price: 1699,
    originalPrice: 2999,
    discount: 43,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_2524copy.jpg?v=1767341999&width=800',
    images: [
      'https://stylejaipur.com/cdn/shop/files/DSC_2524copy.jpg?v=1767341999&width=800',
      'https://stylejaipur.com/cdn/shop/files/DSC_2532copy.jpg?v=1767341999&width=800',
    ],
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.7,
    reviews: 95,
    inStock: true,
    stockQuantity: 25,
    newArrival: true,
  },
  {
    name: 'Vanilla Embroidered Glass Roman Silk Suit Set with Dupatta',
    description: 'Beautiful vanilla embroidered glass roman silk suit set',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC_5412copy_fa5c574e-bdcb-45df-817b-461507c0ee70.jpg?v=1766492018&width=800',
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.5,
    reviews: 78,
    inStock: true,
    stockQuantity: 20,
    newArrival: true,
  },
  {
    name: 'Off White Embroidered Cotton Kurta and Pant Set',
    description: 'Classic off white embroidered cotton kurta and pant set',
    price: 899,
    originalPrice: 2799,
    discount: 67,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=800',
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42', 'XXL-44', '3XL-46', '4XL-48', '5XL-50'],
    category: "Women's Wear",
    subcategory: 'Kurta Set',
    rating: 4.7,
    reviews: 194,
    inStock: true,
    stockQuantity: 100,
    bestSeller: true,
  },
  {
    name: 'Dusty Red Embroidered Pure Mul Chanderi Suit Set',
    description: 'Elegant dusty red embroidered pure mul chanderi suit set',
    price: 1999,
    originalPrice: 3999,
    discount: 50,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC04431copy.jpg?v=1759575976&width=800',
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.6,
    reviews: 112,
    inStock: true,
    stockQuantity: 45,
    bestSeller: true,
  },
  {
    name: 'Dusty Lavender Embroidered Suit Set with Dupatta',
    description: 'Beautiful dusty lavender embroidered suit set with dupatta',
    price: 1199,
    originalPrice: 4399,
    discount: 72,
    image: 'https://stylejaipur.com/cdn/shop/files/DSC03845copy_0cc07a78-2213-42a3-b4c3-63595ce9e803.jpg?v=1759576751&width=800',
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42', 'XXL-44', '3XL-46', '4XL-48', '5XL-50', '6XL-52', '7XL-54'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.59,
    reviews: 68,
    inStock: true,
    stockQuantity: 60,
    bestSeller: true,
  },
  {
    name: 'Carolina Blue Embroidered Suit Set with Dupatta',
    description: 'Stunning carolina blue embroidered suit set with dupatta',
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    image: 'https://stylejaipur.com/cdn/shop/files/WhatsAppImage2025-12-30at5.59.02PM.jpg?v=1767355709&width=800',
    sizes: ['S-36', 'M-38', 'L-40', 'XL-42', 'XXL-44', '3XL-46', '4XL-48', '5XL-50', '6XL-52', '7XL-54'],
    category: "Women's Wear",
    subcategory: 'Suit Set',
    rating: 4.66,
    reviews: 56,
    inStock: true,
    stockQuantity: 40,
    bestSeller: true,
  },
  {
    name: 'Off White Printed Cotton Slub Co-Ord Set',
    description: 'Trendy off white printed cotton slub co-ord set',
    price: 1299,
    originalPrice: 2999,
    discount: 56,
    image: 'https://stylejaipur.com/cdn/shop/files/WhatsAppImage2025-12-16at16.36.38_57d310b9.jpg?v=1765883565&width=800',
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Co-Ord Set',
    rating: 4.4,
    reviews: 45,
    inStock: true,
    stockQuantity: 35,
  },
  {
    name: 'Off White Printed Cotton Flex Co-Ord Set',
    description: 'Comfortable off white printed cotton flex co-ord set',
    price: 849,
    originalPrice: 1999,
    discount: 57,
    image: 'https://stylejaipur.com/cdn/shop/files/WhatsAppImage2023-12-12at9.08.05PM.jpg?v=1728410555&width=800',
    sizes: ['M-38', 'L-40', 'XL-42', 'XXL-44'],
    category: "Women's Wear",
    subcategory: 'Co-Ord Set',
    rating: 4.3,
    reviews: 38,
    inStock: true,
    stockQuantity: 55,
  },
];

const heroSlides = [
  { order: 0, mediaType: 'image', mediaUrl: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=1200', title: 'Advik Creation', subtitle: 'अद्विक क्रिएशन - Your Fashion Destination', buttonText: 'Shop Now', buttonLink: '/new-arrivals' },
  { order: 1, mediaType: 'image', mediaUrl: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=1200', title: 'New Arrivals', subtitle: 'Discover the Latest Fashion Trends', buttonText: 'Explore Collection', buttonLink: '/new-arrivals' },
  { order: 2, mediaType: 'image', mediaUrl: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=1200', title: 'Best Sellers', subtitle: 'Shop Our Most Loved Products', buttonText: 'View Best Sellers', buttonLink: '/best-sellers' },
  { order: 3, mediaType: 'image', mediaUrl: 'https://stylejaipur.com/cdn/shop/files/DSC_2524copy.jpg?v=1767341999&width=1200', title: 'Special Offers', subtitle: 'Extra 5% Off On Prepaid Orders', buttonText: 'Shop Now', buttonLink: '/' },
];

const offers = [
  'Extra 5% Off On Prepaid Order',
  'Buy 2 and Get 10% Off',
  'Buy 3 and Get 15% Off',
];

const reviews = [
  { name: 'Yash Tiwari', review: 'Good dress', product: 'Off White Embroidered Cotton Flex Suit Set', date: '01/04/2026', image: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=400' },
  { name: 'Afra', review: 'Good dress, and fitting', product: 'Off White Embroidered Cotton Kurta and Pant Set', date: '01/03/2026', image: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=400' },
  { name: 'Mansi patil', review: 'This is my first purchase from this brand. Was not disappointed at all loved the fabric super soft and comfy', product: 'Off White Embroidered Cotton Kurta and Pant Set', date: '01/03/2026', image: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=400' },
];

const sampleOrders = [
  {
    orderNumber: 'ORD-000001',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    customerPhone: '+91 9876543210',
    items: [
      { productName: 'Black Printed Cotton Kurta and Pant Set with Dupatta', size: 'L-40', quantity: 1, price: 1199 },
    ],
    total: 1199,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: { street: '42 MG Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001', country: 'India' },
  },
  {
    orderNumber: 'ORD-000002',
    customerName: 'Anita Patel',
    customerEmail: 'anita@example.com',
    items: [
      { productName: 'Off White Embroidered Cotton Kurta and Pant Set', size: 'M-38', quantity: 2, price: 899 },
    ],
    total: 1798,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: { street: '15 Sector 5', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
  },
  {
    orderNumber: 'ORD-000003',
    customerName: 'Rekha Singh',
    customerEmail: 'rekha@example.com',
    items: [
      { productName: 'Coral Blue Embroidered Roman Silk Suit Set', size: 'XL-42', quantity: 1, price: 1699 },
    ],
    total: 1699,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: { street: '8 Connaught Place', city: 'New Delhi', state: 'Delhi', zipCode: '110001', country: 'India' },
  },
  {
    orderNumber: 'ORD-000004',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha@example.com',
    items: [
      { productName: 'Desert Sand Embroidered Roam Silk Suit Set', size: 'M-38', quantity: 1, price: 1999 },
    ],
    total: 1999,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: { street: '22 Banjara Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500034', country: 'India' },
  },
  {
    orderNumber: 'ORD-000005',
    customerName: 'Meera Krishnan',
    customerEmail: 'meera@example.com',
    items: [
      { productName: 'Black Printed Cotton Kurta and Pant Set', size: 'S-36', quantity: 1, price: 1199 },
      { productName: 'Off White Embroidered Cotton Kurta', size: 'M-38', quantity: 1, price: 899 },
    ],
    total: 2098,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: { street: '5 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600040', country: 'India' },
  },
  {
    orderNumber: 'ORD-000006',
    customerName: 'Kavita Mehta',
    customerEmail: 'kavita@example.com',
    items: [{ productName: 'Vanilla Embroidered Glass Roman Silk Suit Set', size: 'L-40', quantity: 1, price: 1999 }],
    total: 1999,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: { street: '12 CG Road', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380006', country: 'India' },
  },
];

const findYourFit = [
  { name: 'New Arrivals', image: 'https://stylejaipur.com/cdn/shop/files/DSC_2461copy.jpg?v=1767345930&width=400', link: '/new-arrivals', category: 'New Arrivals', order: 0 },
  { name: 'Kurta Sets', image: 'https://stylejaipur.com/cdn/shop/files/DSC04449copy.jpg?v=1759575050&width=400', link: '/womens-wear/kurta-set', category: 'Kurta Sets', subcategory: 'Kurta Set', order: 1 },
  { name: 'Co-Ords', image: 'https://stylejaipur.com/cdn/shop/files/WhatsAppImage2025-12-16at16.36.38_57d310b9.jpg?v=1765883565&width=400', link: '/womens-wear/co-ord-set', category: 'Co-Ords', subcategory: 'Co-Ord Set', order: 2 },
  { name: 'Gowns', image: 'https://stylejaipur.com/cdn/shop/files/DSC_5412copy_fa5c574e-bdcb-45df-817b-461507c0ee70.jpg?v=1766492018&width=400', link: '/womens-wear/gown', category: 'Gowns', subcategory: 'Gown', order: 3 },
  { name: 'Dresses', image: 'https://stylejaipur.com/cdn/shop/files/DSC_2524copy.jpg?v=1767341999&width=400', link: '/womens-wear/dress', category: 'Dresses', subcategory: 'Dress', order: 4 },
  { name: "Men's Wear", image: 'https://stylejaipur.com/cdn/shop/files/DSC_2431copy.jpg?v=1767345034&width=400', link: '/mens-wear', category: "Men's Wear", order: 5 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded:', products.length);

    await HeroSlide.deleteMany({});
    await HeroSlide.insertMany(heroSlides);
    console.log('Hero slides seeded:', heroSlides.length);

    await Offer.deleteMany({});
    await Offer.insertMany(offers.map((text, i) => ({ text, order: i })));
    console.log('Offers seeded:', offers.length);

    await Review.deleteMany({});
    await Review.insertMany(reviews);
    console.log('Reviews seeded:', reviews.length);

    await ReviewSummary.deleteMany({});
    await ReviewSummary.create({ rating: 4.7, totalReviews: 2818 });
    console.log('Review summary seeded');

    await FindYourFitCategory.deleteMany({});
    await FindYourFitCategory.insertMany(findYourFit);
    console.log('Find Your Fit categories seeded:', findYourFit.length);

    const productIds = await Product.find().limit(4).select('_id');
    await Story.deleteMany({});
    const storyData = [
      { category: 'New Arrivals', type: 'product', productId: productIds[0]?._id, order: 1 },
      { category: 'New Arrivals', type: 'product', productId: productIds[1]?._id, order: 2 },
      { category: 'Kurta Sets', type: 'product', productId: productIds[2]?._id, order: 1 },
      { category: 'Co-Ords', type: 'product', productId: productIds[3]?._id, order: 1 },
    ].filter((s) => s.productId);
    for (const s of storyData) {
      const p = await Product.findById(s.productId);
      if (p) {
        await Story.create({
          ...s,
          productName: p.name,
          productImage: p.image,
          productPrice: p.price,
          productLink: `/product/${p._id}`,
        });
      }
    }
    console.log('Stories seeded:', storyData.length);

    await Order.deleteMany({});
    const orderProductIds = await Product.find().limit(6).select('_id');
    const ordersWithProductIds = sampleOrders.map((o, i) => ({
      ...o,
      items: o.items.map((item, j) => ({
        ...item,
        productId: orderProductIds[(i + j) % orderProductIds.length]?._id ?? orderProductIds[0]?._id,
      })),
    }));
    await Order.insertMany(ordersWithProductIds);
    console.log('Orders seeded:', sampleOrders.length);

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
