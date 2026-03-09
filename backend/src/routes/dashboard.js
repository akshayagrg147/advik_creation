import express from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ReviewSummary from '../models/ReviewSummary.js';
import Story from '../models/Story.js';
import HeroSlide from '../models/HeroSlide.js';
import Order from '../models/Order.js';

const router = express.Router();

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// GET /api/dashboard/stats - Aggregated stats for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const [
      totalProducts,
      newArrivalsCount,
      bestSellersCount,
      unstitchedCount,
      totalReviews,
      totalStories,
      totalHeroSlides,
      reviewSummaryDoc,
      recentProducts,
      productsByMonth,
      orderStats,
      ordersByRegion,
      recentOrders,
      revenueByMonth,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ newArrival: true }),
      Product.countDocuments({ bestSeller: true }),
      Product.countDocuments({ unstitchedCollection: true }),
      Review.countDocuments(),
      Story.countDocuments(),
      HeroSlide.countDocuments(),
      ReviewSummary.findOne(),
      Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.aggregate([
        { $match: { createdAt: { $exists: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { 'shippingAddress.state': { $exists: true, $ne: '' } } },
        { $group: { _id: '$shippingAddress.state', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { orders: -1 } },
        { $limit: 10 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: { createdAt: { $exists: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const reviewSummary = reviewSummaryDoc || { rating: 4.7, totalReviews: 0 };

    // Build last 6 months chart data (products added per month)
    const now = new Date();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const agg = productsByMonth.find(
        (x) => x._id.year === d.getFullYear() && x._id.month === d.getMonth() + 1
      );
      chartData.push({
        name: monthNames[d.getMonth()],
        products: agg ? agg.count : 0,
        month: d.getMonth() + 1,
      });
    }

    // Map recent products for "Recent Items" table
    const recentProductsFormatted = recentProducts.map((p) => ({
      id: p._id.toString(),
      orderNumber: `PRD-${p._id.toString().slice(-6).toUpperCase()}`,
      customerName: p.name,
      total: p.price,
      status: p.inStock ? 'in stock' : 'out of stock',
      createdAt: p.createdAt,
    }));

    const orderStatsDoc = orderStats[0] || { totalRevenue: 0, totalOrders: 0 };

    // Build revenue chart data (last 6 months)
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const agg = revenueByMonth.find(
        (x) => x._id.year === d.getFullYear() && x._id.month === d.getMonth() + 1
      );
      revenueChartData.push({
        name: monthNames[d.getMonth()],
        revenue: agg ? agg.revenue : 0,
        orders: agg ? agg.orders : 0,
      });
    }

    const ordersByRegionFormatted = ordersByRegion.map((r) => ({
      region: r._id || 'Unknown',
      orders: r.orders,
      revenue: r.revenue,
    }));

    const recentOrdersFormatted = recentOrders.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      region: o.shippingAddress?.state || '-',
      createdAt: o.createdAt,
    }));

    res.json({
      totalProducts,
      newArrivals: newArrivalsCount,
      bestSellers: bestSellersCount,
      unstitchedCollections: unstitchedCount,
      totalReviews,
      totalStories,
      totalHeroSlides,
      reviewSummary: {
        rating: reviewSummary.rating,
        totalReviews: reviewSummary.totalReviews,
      },
      totalRevenue: orderStatsDoc.totalRevenue,
      totalOrders: orderStatsDoc.totalOrders,
      ordersByRegion: ordersByRegionFormatted,
      recentOrders: recentOrdersFormatted,
      revenueChartData,
      recentProducts: recentProductsFormatted,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
