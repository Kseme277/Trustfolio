'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SideCart from '@/components/SideCart';
import ToastProvider from '@/components/ToastProvider';
import CartSyncer from '@/components/CartSyncer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/connexion' || pathname === '/inscription';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900 transition-colors duration-300">
        <ToastProvider>
          {children}
        </ToastProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header />
      <SideCart />
      <CartSyncer />
      <main className="flex-grow">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
      <Footer />
    </div>
  );
} 