'use client';

// Fichier : src/app/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { useState, useEffect } from 'react';

// Import des composants réutilisables pour le design et les animations
import Testimonials from '@/components/Testimonials'; // Section des témoignages clients
import CallToAction from '@/components/CallToAction';   // Section d'appel à l'action finale
import AnimateOnScroll from '@/components/AnimateOnScroll'; // Composant pour les animations au défilement
import BookCardSkeleton from '@/components/BookCardSkeleton'; // Composant pour les indicateurs de chargement (utilisé quand le carrousel charge)
import ClientHeroCarousel from '@/components/ClientHeroCarousel';
import BookGrid from '@/components/BookGrid';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
import VirtuesBar from '@/components/VirtuesBar';
import BookSelectModal from '@/components/BookSelectModal';

// --- Types ---
// Définit la structure attendue d'un objet 'Book'
type Book = {
  id: number;
  title: string;
  shortDescription: string;
  coverImage: string;
  price: number;
};

// --- Composant de la Page d'Accueil ---
export default function Home() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookSelect, setShowBookSelect] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) {
          console.error("API /api/books a échoué avec le statut :", res.status, res.statusText);
          return;
        }
        const booksData = await res.json();
        setBooks(booksData);
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    // Conteneur principal de la page. Les styles de fond et de texte sont définis dans layout.tsx
    <div className="flex flex-col items-center">
      
      {/* Section Hero Améliorée : Mise en page 2 colonnes avec image et boutons */}
      <section id="hero" className="w-full container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Colonne de Gauche : Titre, Slogan et Boutons d'Action */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              {t.heroTitle || 'Et si votre enfant devenait le '}<span className="text-orange-500">{t.heroWord || 'héros'}</span>{t.heroTitleSuffix || ' de son propre livre ?'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t.heroSubtitle || 'Des livres 100% personnalisés, éducatifs et enracinés dans la culture africaine.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="#" onClick={e => { e.preventDefault(); setShowBookSelect(true); }} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105">
                {t.customizeBook || 'Personnaliser un livre'}
              </Link>
              <Link href="/livres" className="bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">
                {t.seeBooks || 'Voir nos livres'}
              </Link>
            </div>
          </div>

          {/* Colonne de Droite : Image Visuelle avec Indicateur Personnalisé */}
          <div className="relative w-full h-80 lg:h-96 flex items-center justify-center">
            <ClientHeroCarousel />
          </div>
        </div>
      </section>

      {/* Section Livres Disponibles restaurée et modernisée */}
      <section id="available-books" className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t.availableBooks || 'Nos Livres Disponibles'}
          </h2>
          <Link href="#" onClick={e => { e.preventDefault(); setShowBookSelect(true); }} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300">
            {t.customizeBook || 'Personnaliser un livre'}
          </Link>
        </div>
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 shadow-xl p-6 md:p-10">
          {isLoading ? (
            <div className="flex justify-center">
              <BookCardSkeleton />
            </div>
          ) : (
            <BookGrid books={books} />
          )}
        </div>
      </section>

      {/* Section Vertus */}
      <VirtuesBar />

      {/* Section Commentaires modernisée */}
      <section id="testimonials" className="w-full max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          {t.testimonialsTitle || 'Ils en parlent mieux que nous'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Exemple de témoignage modernisé */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src="/ines-murielle.jpg" alt="Témoin 1" className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-orange-400" />
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-200 mb-2">
              {t.testimonial1 || '“Une expérience incroyable, mon enfant a adoré son livre personnalisé !”'}
            </blockquote>
            <span className="font-semibold text-orange-500">Inès Murielle</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.parent || 'Parent'}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src="/img.jpeg" alt="Témoin 2" className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-orange-400" />
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-200 mb-2">
              {t.testimonial2 || '“Le design, la personnalisation, tout est parfait. Je recommande à 100%.”'}
            </blockquote>
            <span className="font-semibold text-orange-500">Anya Bond</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.teacher || 'Enseignante'}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src="/contes-africains.webp" alt="Témoin 3" className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-orange-400" />
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-200 mb-2">
              {t.testimonial3 || '“Enfin une plateforme qui valorise la culture africaine pour les enfants !”'}
            </blockquote>
            <span className="font-semibold text-orange-500">Jean-Marc K.</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.parent || 'Parent'}
            </span>
          </div>
        </div>
      </section>
      
      {/* Section Appel à l'Action Finale avec Animation d'entrée au défilement */}
      <AnimateOnScroll delay={0.25}>
        <CallToAction />
      </AnimateOnScroll>
      {showBookSelect && <BookSelectModal open={showBookSelect} onClose={() => setShowBookSelect(false)} />}
    </div>
  );
}