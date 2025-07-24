// Fichier : src/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS, Lang } from '@/i18n/translations';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/livres', label: t.books },
    { href: '/personaliser/1', label: t.customBooks },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <img src="/Logo TrustFolio.png" alt="Trustfolio Logo" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm" />
          <span className="text-2xl font-bold text-orange-500">Trustfolio</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-6 items-center">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Desktop Lang Selector */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value as Lang)}
          className="hidden sm:block border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ml-4"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
          <option value="ar">العربية</option>
        </select>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Lang)}
              className="mt-4 border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
}