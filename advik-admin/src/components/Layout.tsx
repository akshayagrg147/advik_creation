import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  FilmIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/products', label: 'Products', icon: ShoppingBagIcon },
    { path: '/hero-banners', label: 'Hero Banners', icon: PhotoIcon },
    { path: '/stories', label: 'Stories/Reels', icon: FilmIcon },
    { path: '/customer-reviews', label: 'Customer Reviews', icon: ChatBubbleLeftRightIcon },
    { path: '/orders', label: 'Orders', icon: TagIcon },
    { path: '/customers', label: 'Customers', icon: UserGroupIcon },
    { path: '/categories', label: 'Categories', icon: TagIcon },
    { path: '/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-100 min-h-screen">
      {/* Sidebar: full height, scrollable on small screens */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 w-[280px] max-w-[85vw] sm:w-64 bg-gray-900 text-white transition-transform duration-300 z-30 h-full flex flex-col`}
      >
        <div className="p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Advik Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white p-1 -mr-1"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto flex-shrink-0 p-4 sm:p-6 border-t border-gray-800">
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 sm:px-4 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 p-2 -ml-2"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0" />
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[140px] md:max-w-none">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[140px] md:max-w-none hidden sm:block">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
