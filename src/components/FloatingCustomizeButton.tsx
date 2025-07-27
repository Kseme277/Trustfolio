'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
import BookSelectModal from './BookSelectModal';
import { BookOpen } from 'lucide-react';

export default function FloatingCustomizeButton() {
  const [showBookSelect, setShowBookSelect] = useState(false);
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setShowBookSelect(true)}
        className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
        aria-label={Array.isArray(t.customizeBook) ? t.customizeBook[0] : t.customizeBook || 'Personnaliser un livre'}
      >
        <BookOpen size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {t.customizeBook || 'Personnaliser un livre'}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </button>

      {/* Modal de sélection de livre */}
      {showBookSelect && (
        <BookSelectModal 
          open={showBookSelect} 
          onClose={() => setShowBookSelect(false)} 
        />
      )}
    </>
  );
} 