import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

interface Book {
  id: number;
  title: string;
  coverImage: string;
}

interface BookSelectModalProps {
  open: boolean;
  onClose: () => void;
}

const fetchBooks = async (): Promise<Book[]> => {
  const res = await fetch('/api/books');
  if (!res.ok) return [];
  return res.json();
};

export default function BookSelectModal({ open, onClose }: BookSelectModalProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchBooks().then(setBooks);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full h-[80vh] mx-4 p-6 relative animate-fadeIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-orange-500">{t.customizeBook || 'Personnaliser un livre'}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
            aria-label={Array.isArray(t.close) ? t.close[0] : t.close || 'Fermer'}
          >
            &times;
          </button>
        </div>
        
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {books.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg">Aucun livre disponible pour le moment.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map(book => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => router.push(`/personaliser/${book.id}`), 100);
                  }}
                  className="flex flex-col items-center p-4 border-2 border-orange-200 dark:border-orange-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative mb-3">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-24 h-32 object-cover rounded-lg shadow-md" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white text-center text-sm leading-tight">
                    {book.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Cliquez sur un livre pour commencer la personnalisation
          </p>
        </div>
      </div>
    </div>
  );
} 