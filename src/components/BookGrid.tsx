import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Book } from './BookModal';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
import BookModal, { Book as BookType } from './BookModal';

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
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center shadow-sm p-4 min-h-[370px] transition-all duration-300 hover:shadow-lg"
        >
          <div className="w-full flex justify-center mb-4 relative group"
            onMouseEnter={() => setHovered(book.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <Image
              src={book.coverImage && [
                '/logo_jpg.jpg',
                '/loho_trsutfolio.png',
                '/trustfolio_logo.jpeg',
                '/sans_titre_1-10-884af-c0e63.jpg',
                '/mtn-mobile-money-logo.jpg',
                '/on_a_kidnappe_le_pere_noel-22a71-295c2.jpg',
                '/orange-money-logo-png_seeklogo-440383.png',
                '/ines-murielle.jpg',
                '/les_contes_provencaux_tome_5-0269b-4539f.jpg',
                '/img.jpeg',
                '/homme-americain-africain-pointage.jpg',
                '/hero-image.webp',
                '/enseignant-aidant-les-enfants-en-classe.jpg',
                '/facture_livre.jpeg',
                '/couverture-5-2-3392e-618c3.jpg',
                '/d.jpeg',
                '/contes-africains.webp',
                '/beau-jeune-mec-posant-contre-le-mur-blanc.jpg',
                '/appelez-moi-de-temps-en-temps-portrait-d-un-homme-afro-americain-effronte-et-confiant-montrant-un-signe-de-telephone-pres-de-la-tete-et-souriant.jpg',
                '/Livre.jpeg',
                '/Grady-bear-online-picture-book.webp',
                '/Amazing-me-digital-storybook.webp'
              ].includes(book.coverImage)
                ? book.coverImage
                : '/Livre.jpeg'}
              alt={book.title}
              width={180}
              height={220}
              className="object-contain rounded-xl h-56 w-auto"
              priority={false}
            />
            {/* Icône œil animée sur hover */}
            <button
              type="button"
              onClick={() => setOpenModalId(book.id)}
              className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 ${hovered === book.id ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Voir les détails du livre"
            >
              <svg width="40" height="40" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                <path d="M1 20s7-12 19-12 19 12 19 12-7 12-19 12S1 20 1 20z"/>
                <circle cx="20" cy="20" r="5"/>
              </svg>
            </button>
          </div>
          <Link
            href={`/personaliser/${book.id}`}
            className="w-full max-w-sm mx-auto mb-4 py-2 px-3 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 hover:from-orange-600 hover:to-orange-400 text-white font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-center whitespace-nowrap transition-all duration-300 ease-in-out"
            aria-label={Array.isArray(t.customizeBook) ? t.customizeBook[0] : t.customizeBook || 'Personnaliser'}
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('selectedBookId', String(book.id));
              }
            }}
          >
            {lang === 'fr' ? 'Personnaliser' : (Array.isArray(t.customizeBook) ? t.customizeBook[0] : t.customizeBook || 'Customize')}
          </Link>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-0 break-words line-clamp-3 text-center" style={{ minHeight: '4.5rem' }}>{book.title}</h3>
        </div>
      ))}
      {openModalId !== null && (
        <BookModal
          open={true}
          onClose={() => setOpenModalId(null)}
          book={books.find(b => b.id === openModalId) as BookType}
        />
      )}
    </div>
  );
} 