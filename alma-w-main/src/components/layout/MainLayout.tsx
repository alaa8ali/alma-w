import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '@components/common/CartDrawer';
import MenuDrawer from '@components/common/MenuDrawer';
import LocationModal from '@components/common/LocationModal';
import AuthModal from '@components/common/AuthModal';
import Chatbot from '@components/common/Chatbot';
import { useAppStore } from '@store/appStore';

const MainLayout: React.FC = () => {
  const {
    isCartOpen,
    isMenuOpen,
    isLocationModalOpen,
    isAuthModalOpen,
    setCartOpen,
    setMenuOpen,
    setLocationModalOpen,
    setAuthModalOpen,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Header scrolled={scrolled} />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setLocationModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default MainLayout;
