'use client';
import { useEffect, useState } from 'react';
import { TRANSLATIONS } from '@/i18n/translations';

const SUPPORTED_LANGS = ['fr', 'en', 'de', 'es', 'ar'];

export default function NotFound() {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
        setLang(browserLang);
      }
    }
  }, []);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-red-600 mb-6">{t.error404Title || 'Page non trouvée'}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">{t.error404Message || "Désolé, la page que vous cherchez n'existe pas ou a été déplacée."}</p>
      <a href="/" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-all duration-300">
        {t.backToHome || 'Retour à l\'accueil'}
      </a>
    </div>
  );
} 