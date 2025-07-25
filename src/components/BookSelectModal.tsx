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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
          aria-label={Array.isArray(t.close) ? t.close[0] : t.close || 'Fermer'}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-orange-500">{t.customizeBook || 'Personnaliser un livre'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {books.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500">Aucun livre disponible pour le moment.</div>
          ) : books.map(book => (
            <button
              key={book.id}
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => router.push(`/personaliser/${book.id}`), 100);
              }}
              className="flex flex-col items-center p-4 border border-orange-200 rounded-xl hover:bg-orange-50 transition"
            >
              <img src={book.coverImage} alt={book.title} className="w-20 h-28 object-contain rounded mb-2" />
              <span className="font-semibold text-gray-800 dark:text-white text-center">{book.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 