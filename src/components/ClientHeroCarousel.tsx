'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    src: '/img.jpeg',
    alt: 'Enfant lisant un livre personnalisé sous un arbre',
    badgeTitle: '100% personnalisé',
    badgeText: 'Votre enfant devient le héros',
  },
  {
    src: '/hero-image.webp',
    alt: 'Livre personnalisé',
    badgeTitle: 'Impression premium',
    badgeText: 'Papier épais, couleurs éclatantes',
  },
  {
    src: '/enseignant-aidant-les-enfants-en-classe.jpg',
    alt: 'Lecture en famille',
    badgeTitle: 'Pour toute la famille',
    badgeText: 'Des histoires qui rassemblent',
  },
];

export default function ClientHeroCarousel() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-80 lg:h-96 flex items-center justify-center">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            style={{ objectFit: 'cover', color: 'transparent' }}
            className="rounded-2xl"
            priority={idx === 0}
          />
          {/* Badge sur l'image visible */}
          {idx === current && (
            <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg flex items-center gap-3 shadow-lg">
              <div className="bg-green-500 p-1 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{slide.badgeTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{slide.badgeText}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 