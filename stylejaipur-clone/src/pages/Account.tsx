import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerOrders } from '../api/orders';
import { useAuth } from '../context/useAuth';
import type { Order } from '../types';

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-700 ring-green-100';
    case 'processing':
    case 'shipped':
      return 'bg-blue-50 text-blue-700 ring-blue-100';
    case 'cancelled':
      return 'bg-red-50 text-red-700 ring-red-100';
    case 'pending':
    default:
      return 'bg-amber-50 text-amber-700 ring-amber-100';
  }
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const Account = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getCustomerOrders({ phone: user.phone, email: user.email });
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Account</h1>
          <p className="mt-3 text-gray-600">Verify your mobile number during checkout to see your profile and past orders here.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">My Account</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Profile and orders</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-lg font-bold text-white">
              {(user.phone || user.email || 'A').slice(-2).replace(/\D/g, '') || 'AC'}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-950">Advik customer</h2>
              <p className="truncate text-sm text-gray-500">{user.phone || user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mobile</p>
              <p className="mt-1 font-medium text-gray-900">{user.phone || 'Not added'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
              <p className="mt-1 font-medium text-gray-900">{user.email || 'Collected during checkout'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Orders</p>
              <p className="mt-1 font-medium text-gray-900">{orders.length} total</p>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Past orders</h2>
              <p className="text-sm text-gray-500">Full order details linked to your verified phone number.</p>
            </div>
          </div>

          {loading && (
            <div className="rounded-lg border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
              Loading orders...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-950">No orders yet</h3>
              <p className="mt-2 text-sm text-gray-500">Once you place an order, its products, address, payment and status will appear here.</p>
              <Link
                to="/new-arrivals"
                className="mt-5 inline-flex rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Browse new arrivals
              </Link>
            </div>
          )}

          {!loading &&
            !error &&
            orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-gray-700 ring-1 ring-gray-200">
                      {order.paymentMethod || 'prepaid'} · {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}-${item.size}`} className="flex gap-4">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-20 w-16 rounded-md object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-950">{item.productName}</h3>
                          <p className="mt-1 text-sm text-gray-500">Size {item.size} · Qty {item.quantity}</p>
                        </div>
                        <p className="shrink-0 font-semibold text-gray-950">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery address</p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {order.shippingAddress.street}
                        {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order total</p>
                      <p className="mt-2 text-2xl font-bold text-gray-950">Rs. {order.total.toLocaleString()}</p>
                      {order.orderNotes && <p className="mt-2 text-sm text-gray-500">Note: {order.orderNotes}</p>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </div>
  );
};

export default Account;
