import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Book } from './BookModal';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

const EyeIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
);
const CartIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);
const HeartIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center shadow-sm p-4 min-h-[370px] transition-all duration-300 hover:shadow-lg"
        >
          <div className="w-full flex justify-center mb-4">
            <Image
              src={book.coverImage}
              alt={book.title}
              width={180}
              height={220}
              className="object-contain rounded-xl h-56 w-auto"
              priority={false}
            />
          </div>
          <Link
            href={`/personaliser/${book.id}`}
            className="w-full max-w-xs mx-auto mb-4 py-2 px-6 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 hover:from-orange-600 hover:to-orange-400 text-white font-bold text-base uppercase tracking-wide shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-center whitespace-normal break-words transition-all duration-300 ease-in-out"
            aria-label={Array.isArray(t.customizeBook) ? t.customizeBook[0] : t.customizeBook || 'Personnaliser'}
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('selectedBookId', String(book.id));
              }
            }}
          >
            {lang === 'fr' ? (<span>person-<wbr />naliser</span>) : (Array.isArray(t.customizeBook) ? t.customizeBook[0] : t.customizeBook || 'Customize')}
          </Link>
          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-0 break-words line-clamp-3 text-center" style={{ minHeight: '4.5rem' }}>{book.title}</h3>
        </div>
      ))}
    </div>
  );
} 