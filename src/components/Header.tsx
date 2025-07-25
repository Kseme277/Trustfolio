// Fichier : src/components/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS, Lang } from '@/i18n/translations';
import { Menu, X, Sun, Moon, ShoppingCart } from 'lucide-react';
import BookSelectModal from './BookSelectModal';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';

export default function Header() {
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showBookSelect, setShowBookSelect] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langMenuOpen]);

  // Fermer le menu au clavier (Escape ou Tab hors menu)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLangMenuOpen(false);
      if (event.key === 'Tab') setLangMenuOpen(false);
    }
    if (langMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [langMenuOpen]);

  const { items } = useCartStore();
  const [personalizedOrdersCount, setPersonalizedOrdersCount] = useState(0);

  // Synchronise le nombre de commandes personnalisées avec la SideCart
  useEffect(() => {
    async function fetchPersonalizedOrdersCount() {
      let userId = null;
      let guestToken = null;
      if (typeof window !== 'undefined') {
        const phoneAuth = localStorage.getItem('phoneAuth');
        if (phoneAuth) {
          try {
            const userData = JSON.parse(phoneAuth);
            userId = userData?.id;
          } catch {}
        }
        if (!userId) {
          guestToken = localStorage.getItem('guestToken');
        }
      }
      let url = '/api/orders?status=IN_CART';
      if (userId) url += `&userId=${userId}`;
      else if (guestToken) url += `&guestToken=${guestToken}`;
      else {
        setPersonalizedOrdersCount(0);
        return;
      }
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPersonalizedOrdersCount(Array.isArray(data) ? data.length : 0);
        } else {
          setPersonalizedOrdersCount(0);
        }
      } catch {
        setPersonalizedOrdersCount(0);
      }
    }
    fetchPersonalizedOrdersCount();
    window.addEventListener('cart-updated', fetchPersonalizedOrdersCount);
    return () => window.removeEventListener('cart-updated', fetchPersonalizedOrdersCount);
  }, []);

  // Le nombre exact de commandes = items.length (standards) + personalizedOrdersCount (personnalisées)
  const cartCount = items.length + personalizedOrdersCount;

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/livres', label: t.books },
    { href: '/personaliser/1', label: t.customBooks },
    { href: '/contact', label: 'Contact' },
  ];

  const flagList = [
    { code: 'fr', src: 'https://flagcdn.com/w20/fr.png', alt: 'Français', label: 'Français' },
    { code: 'en', src: 'https://flagcdn.com/w20/gb.png', alt: 'English', label: 'English' },
    { code: 'de', src: 'https://flagcdn.com/w20/de.png', alt: 'Deutsch', label: 'Deutsch' },
    { code: 'es', src: 'https://flagcdn.com/w20/es.png', alt: 'Español', label: 'Español' },
    { code: 'ar', src: 'https://flagcdn.com/w20/sa.png', alt: 'العربية', label: 'العربية' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo image TrustFolio */}
        <Link href="/" className="flex items-center select-none">
          <img src="/loho_trsutfolio.png" alt="Trustfolio Logo" className="w-20 h-20 rounded-full object-contain" />
        </Link>
        {/* Hamburger pour mobile */}
        <button className="sm:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400" onClick={() => setMobileMenuOpen(true)} aria-label="Ouvrir le menu">
          <Menu size={32} />
        </button>
        {/* Liens centraux + bouton + sélecteur de langue (desktop) */}
        <nav className="hidden sm:flex gap-10 items-center">
          <Link href="/" className="text-xl font-bold font-sans text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors">{t.home || 'Accueil'}</Link>
          <Link href="/livres" className="text-xl font-bold font-sans text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors">{t.books || t.shop || 'Boutique'}</Link>
          <Link href="#" onClick={e => { e.preventDefault(); setShowBookSelect(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-sans px-8 py-3 rounded-lg text-base transition-colors">{t.customizeBook || 'Personnaliser'}</Link>
          <Link href="/a-propos" className="text-xl font-bold font-sans text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors">{t.about || 'À propos'}</Link>
          {/* Sélecteur de langue custom (desktop) */}
          <div className="hidden sm:block ml-4 relative" ref={langMenuRef}>
            <button
              className="w-12 h-12 border rounded-full bg-white dark:bg-gray-800 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Changer de langue"
              onClick={() => setLangMenuOpen((v) => !v)}
              tabIndex={0}
            >
              <img src={flagList.find(f => f.code === lang)?.src} alt={lang} className="w-8 h-8 object-cover rounded-full border-2 border-white shadow-sm bg-white overflow-hidden" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 flex flex-col min-w-[48px]">
                {flagList.map(flag => (
                  <button
                    key={flag.code}
                    onClick={() => { setLang(flag.code as Lang); setLangMenuOpen(false); }}
                    className={`p-2 flex items-center justify-center hover:bg-orange-100 dark:hover:bg-gray-800 focus:outline-none ${lang === flag.code ? 'ring-2 ring-orange-400' : ''}`}
                    aria-label={flag.alt}
                    tabIndex={0}
                  >
                    <img src={flag.src} alt={flag.alt} className="w-8 h-8 object-cover rounded-full border-2 border-white shadow-sm bg-white overflow-hidden" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 ml-4">
            <Link href="/panier" className="relative hover:text-orange-500 transition-colors" aria-label="Panier">
              <ShoppingCart size={28} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow border-2 border-white dark:border-gray-900 z-10">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={toggleTheme} className="hover:text-orange-500 transition-colors" aria-label="Changer le thème">
              {theme === 'dark' ? <Sun size={26} /> : <Moon size={26} />}
            </button>
          </div>
        </nav>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg flex flex-col p-6 gap-6" onClick={e => e.stopPropagation()}>
            <button
              className="self-end mb-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Fermer le menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>
            <nav className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 relative" ref={langMenuRef}>
              <button
                className="w-12 h-12 border rounded-full bg-white dark:bg-gray-800 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label="Changer de langue"
                onClick={() => setLangMenuOpen((v) => !v)}
                tabIndex={0}
              >
                <img src={flagList.find(f => f.code === lang)?.src} alt={lang} className="w-8 h-8 object-cover rounded-full border-2 border-white shadow-sm bg-white overflow-hidden" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 flex flex-col min-w-[48px]">
                  {flagList.map(flag => (
                    <button
                      key={flag.code}
                      onClick={() => { setLang(flag.code as Lang); setLangMenuOpen(false); }}
                      className={`p-2 flex items-center justify-center hover:bg-orange-100 dark:hover:bg-gray-800 focus:outline-none ${lang === flag.code ? 'ring-2 ring-orange-400' : ''}`}
                      aria-label={flag.alt}
                      tabIndex={0}
                    >
                      <img src={flag.src} alt={flag.alt} className="w-8 h-8 object-cover rounded-full border-2 border-white shadow-sm bg-white overflow-hidden" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showBookSelect && <BookSelectModal open={showBookSelect} onClose={() => setShowBookSelect(false)} />}
    </header>
  );
}