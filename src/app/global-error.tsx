'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  useEffect(() => {
    console.error('Erreur globale de l\'application:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-bold text-red-600 mb-6">{t.globalErrorTitle || 'Erreur inattendue'}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">{t.globalErrorMessage || 'Une erreur inattendue est survenue. Veuillez réessayer ou contacter le support.'}</p>
          <button onClick={reset} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-all duration-300">
            {t.tryAgain || 'Réessayer'}
          </button>
        </div>
      </body>
    </html>
  );
} 