'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang } from '@/i18n/translations';

interface LanguageContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  useEffect(() => {
    // Détecter la langue du navigateur au premier chargement
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language?.split('-')[0];
      if (["fr","en","de","es","ar"].includes(browserLang)) {
        setLang(browserLang as Lang);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
} 