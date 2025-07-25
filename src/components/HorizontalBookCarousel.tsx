// Fichier : src/components/HorizontalBookCarousel.tsx
'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Définition des types LOCALEMENT dans ce fichier ---
// Cela contourne le problème d'importation de src/types/app.d.ts
type Book = {
  id: number;
  title: string;
  shortDescription: string;
  coverImage: string;
  price: number;
};

interface HorizontalBookCarouselProps {
  books: Book[];
  itemsVisible?: number;
  scrollInterval?: number;
}

export default function HorizontalBookCarousel({
  books,
  itemsVisible = 1,
  scrollInterval = 4000,
}: HorizontalBookCarouselProps) {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const [itemCalculatedWidth, setItemCalculatedWidth] = useState(0);

  const displayedBooks = [...books, ...books, ...books];

  useLayoutEffect(() => {
    if (itemRef.current && itemRef.current.offsetWidth > 0) {
      const width = itemRef.current.offsetWidth;
      const totalItemWidthWithGap = width + 32;
      if (totalItemWidthWithGap !== itemCalculatedWidth) {
          setItemCalculatedWidth(totalItemWidthWithGap);
      }
    }
  }, [books, itemCalculatedWidth]);

  useEffect(() => {
    if (books.length === 0 || itemCalculatedWidth === 0) return;

    const animateScroll = async () => {
      const nextIndex = currentIndex + 1;
      
      await controls.start({
        x: -nextIndex * itemCalculatedWidth,
        transition: { duration: 1.2, ease: 'easeInOut' },
      });
      
      setCurrentIndex(nextIndex);

      if (nextIndex >= books.length) {
        setTimeout(() => {
            controls.set({ x: 0 });
            setCurrentIndex(0);
        }, 1200);
      }
    };

    const interval = setInterval(animateScroll, scrollInterval);
    return () => clearInterval(interval);
  }, [currentIndex, books, controls, itemCalculatedWidth, scrollInterval, displayedBooks.length]);

  if (books.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Aucun livre disponible.</p>;
  }

  const carouselVisibleWidth = itemCalculatedWidth * itemsVisible;
  const bookCardVisualHeight = 450;


  return (
    <div 
      className="relative w-3/4 mx-auto overflow-hidden rounded-lg shadow-xl" 
      style={{ height: `${bookCardVisualHeight}px` }}
    >
      <motion.div
        animate={controls}
        className="flex flex-row gap-8"
        style={{ width: `${itemCalculatedWidth * displayedBooks.length}px` }} 
      >
        {displayedBooks.map((book, index) => (
          <div key={`${book.id}-${index}`} ref={index === 0 ? itemRef : null} className="flex-shrink-0 w-[320px]">
            <Link 
              href={`/personaliser/${book.id}`} 
              className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="relative w-full h-72 group">
                  <Image src={book.coverImage} alt={`Couverture de ${book.title}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 50vw" className="transition-transform duration-300 group-hover:scale-110" />
                  {/* Icône œil animée sur hover */}
                  <Link href={`/personaliser/${book.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white drop-shadow-lg animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12s-4.5 7.5-10.5 7.5S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 h-12">{book.shortDescription}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-orange-500">{book.price} FCFA</span>
                  <div className="text-orange-500 font-semibold flex items-center gap-2">
                    Personnaliser
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
}