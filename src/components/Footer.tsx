// Fichier : src/components/Footer.tsx
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function Footer() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo ou nom */}
        <div className="flex items-center gap-3">
          <img src="/Logo TrustFolio.png" alt="Trustfolio Logo" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm" />
          <span className="text-2xl font-bold text-orange-500">Trustfolio</span>
        </div>
        {/* Liens principaux */}
        <nav className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-200 text-base font-medium">
          <Link href="/">{t.footerHome}</Link>
          <Link href="/livres">{t.footerShop}</Link>
          <Link href="/personaliser/1">{t.footerPersonalizedBooks}</Link>
          <Link href="/contact">{t.footerContact}</Link>
        </nav>
        {/* Réseaux sociaux */}
        <div className="flex gap-4">
          <a href="#" aria-label="Facebook" className="hover:text-orange-500"><svg width="24" height="24" fill="currentColor"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12"/></svg></a>
          <a href="#" aria-label="Twitter" className="hover:text-orange-500"><svg width="24" height="24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.77c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.12 2.9 3.99 2.93A8.6 8.6 0 0 1 2 19.54c-.65 0-1.29-.04-1.92-.11A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z"/></svg></a>
          <a href="#" aria-label="Instagram" className="hover:text-orange-500"><svg width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M16.8 2H7.2A5.2 5.2 0 0 0 2 7.2v9.6A5.2 5.2 0 0 0 7.2 22h9.6A5.2 5.2 0 0 0 22 16.8V7.2A5.2 5.2 0 0 0 16.8 2zm3.2 14.8a3.2 3.2 0 0 1-3.2 3.2H7.2a3.2 3.2 0 0 1-3.2-3.2V7.2a3.2 3.2 0 0 1 3.2-3.2h9.6a3.2 3.2 0 0 1 3.2 3.2v9.6z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Trustfolio. {t.footerCopyright}
      </div>
    </footer>
  );
}