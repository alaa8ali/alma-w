import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

// Layouts
import MainLayout from '@components/layout/MainLayout';
import AdminLayout from '@components/layout/AdminLayout';

// Pages
import HomePage from '@pages/HomePage';
import StorePage from '@pages/StorePage';
import RestaurantPage from '@pages/RestaurantPage';
import SweetsPage from '@pages/SweetsPage';
import ServicesPage from '@pages/ServicesPage';
import WholesalePage from '@pages/WholesalePage';
import ProductDetailPage from '@pages/ProductDetailPage';
import VendorPage from '@pages/VendorPage';
import CheckoutPage from '@pages/CheckoutPage';
import OrderTrackingPage from '@pages/OrderTrackingPage';
import ProfilePage from '@pages/ProfilePage';
import OrdersPage from '@pages/OrdersPage';
import FavoritesPage from '@pages/FavoritesPage';
import SearchPage from '@pages/SearchPage';
import NotFoundPage from '@pages/NotFoundPage';

// Admin Pages
import AdminDashboard from '@pages/admin/AdminDashboard';
import AdminProducts from '@pages/admin/AdminProducts';
import AdminOrders from '@pages/admin/AdminOrders';
import AdminCustomers from '@pages/admin/AdminCustomers';
import AdminAnalytics from '@pages/admin/AdminAnalytics';
import AdminSettings from '@pages/admin/AdminSettings';

// Auth Pages
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';

// ⭐ تمت إضافة صفحة الخريطة هنا
import MapPage from '@pages/MapPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin' && user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { theme, language } = useAppStore();

  useEffect(() => {
    // Set initial theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set initial language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [theme, language]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="restaurant" element={<RestaurantPage />} />
            <Route path="sweets" element={<SweetsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="wholesale" element={<WholesalePage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="vendor/:id" element={<VendorPage />} />
            <Route path="search" element={<SearchPage />} />

            {/* ⭐ إضافة صفحة الخريطة هنا */}
            <Route path="map" element={<MapPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes with Main Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="order/:id" element={<OrderTrackingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>

          {/* Admin/Vendor Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position={language === 'ar' ? 'top-left' : 'top-right'}
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#f3f4f6' : '#111827',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
