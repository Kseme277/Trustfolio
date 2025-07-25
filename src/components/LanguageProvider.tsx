'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang } from '@/i18n/translations';

interface LanguageContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  // Persistance locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('lang');
      if (storedLang && ["fr","en","de","es","ar"].includes(storedLang)) {
        setLangState(storedLang as Lang);
        return;
      }
      // Détection navigateur si pas de langue stockée
      const browserLang = navigator.language?.split('-')[0];
      if (["fr","en","de","es","ar"].includes(browserLang)) {
        setLangState(browserLang as Lang);
      }
    }
  }, []);

  // Sauvegarde la langue à chaque changement
  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
    }
  };

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