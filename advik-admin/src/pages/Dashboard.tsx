import { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  FilmIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../api/dashboard';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue ?? 0).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'bg-green-500' },
    { title: 'Total Orders', value: stats.totalOrders ?? 0, icon: ChartBarIcon, color: 'bg-purple-500' },
    { title: 'Total Products', value: stats.totalProducts, icon: ShoppingBagIcon, color: 'bg-blue-500' },
    { title: 'Customer Reviews', value: stats.reviewSummary.totalReviews, icon: ChatBubbleLeftRightIcon, color: 'bg-teal-500' },
    { title: 'Stories / Reels', value: stats.totalStories, icon: FilmIcon, color: 'bg-indigo-500' },
    { title: 'New Arrivals', value: stats.newArrivals, icon: ShoppingBagIcon, color: 'bg-red-500' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'in stock') return 'bg-green-100 text-green-800';
    if (status === 'out of stock') return 'bg-red-100 text-red-800';
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'processing' || status === 'shipped') return 'bg-blue-100 text-blue-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const revenueChartData = stats.revenueChartData ?? stats.chartData.map((d) => ({ name: d.name, revenue: 0, orders: 0 }));
  const ordersByRegion = stats.ordersByRegion ?? [];
  const recentOrders = stats.recentOrders ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2 truncate">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#16a34a" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Products Added (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="products" stroke="#ef4444" strokeWidth={2} name="Products" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Region */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          Orders by Placed Region
        </h2>
        {ordersByRegion.length === 0 ? (
          <p className="text-gray-500 py-4 text-sm">No order data by region yet</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Region (State)</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ordersByRegion.map((r) => (
                    <tr key={r.region} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.region}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.orders}</td>
                      <td className="px-4 py-3 text-right text-gray-600">₹{r.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-2">
              {ordersByRegion.map((r) => (
                <div key={r.region} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-900 text-sm">{r.region}</span>
                  <span className="text-sm text-gray-600">{r.orders} orders · ₹{r.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerName}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.region}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{order.total.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-500 text-sm">No orders yet</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{order.customerName}</p>
                <p className="text-xs text-gray-500 mt-1">{order.region} · ₹{order.total.toLocaleString()} · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Products</h2>
          <p className="text-sm text-gray-500 mt-1">Latest products added to your catalog</p>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products yet
                  </td>
                </tr>
              ) : (
                stats.recentProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.orderNumber}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.customerName}>
                      {item.customerName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ₹{item.total.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {stats.recentProducts.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-500 text-sm">No products yet</p>
          ) : (
            stats.recentProducts.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 truncate">{item.customerName}</p>
                <p className="text-xs text-gray-500 mt-1">₹{item.total.toLocaleString()} · {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
