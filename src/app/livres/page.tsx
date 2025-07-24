// Fichier : src/app/livres/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BookGrid from '@/components/BookGrid';
import BookCardSkeleton from '@/components/BookCardSkeleton'; // Import des skeletons
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

// --- Types ---
type Book = { id: number; title: string; shortDescription: string; coverImage: string; price: number; tags: string[]; };
type Value = { id: number; name_fr?: string; name_en?: string; name_de?: string; name_es?: string; name_ar?: string; };

export default function BooksPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [allValues, setAllValues] = useState<Value[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [priceLimit, setPriceLimit] = useState(100000);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  // Chargement initial des données (livres et valeurs)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [booksRes, valuesRes] = await Promise.all([
          fetch('/api/books'),
          fetch('/api/values'),
        ]);
        const booksData: Book[] = await booksRes.json();
        const valuesData: Value[] = await valuesRes.json();
        
        setAllBooks(booksData);
        setAllValues(valuesData);
      } catch (error) {
        console.error("Erreur de chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Fonction pour appliquer les filtres (mémorisée avec useCallback)
  const applyFilters = useCallback(() => {
    let booksToFilter = [...allBooks];

    // 1. Filtre par recherche textuelle (titre)
    if (searchTerm) {
      booksToFilter = booksToFilter.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 2. Filtre par prix maximum
    booksToFilter = booksToFilter.filter(book => book.price <= priceLimit);

    // 3. Filtre par tags/valeurs multiples
    if (selectedTags.length > 0) {
      booksToFilter = booksToFilter.filter(book =>
        selectedTags.some(tag => book.tags.includes(tag))
      );
    }

    setFilteredBooks(booksToFilter);
  }, [allBooks, searchTerm, priceLimit, selectedTags]); // Dépendances des filtres

  // Déclenche l'application des filtres à chaque fois qu'un paramètre de filtre change
  useEffect(() => {
    if (allBooks.length > 0) {
      applyFilters();
    }
  }, [allBooks, searchTerm, priceLimit, selectedTags]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t.booksPageTitle}</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne de Gauche : Filtres */}
        <aside className="w-full md:w-1/4 lg:w-1/5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">{t.filtersTitle}</h2>
          
          {/* Filtre Recherche */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.searchByTitleLabel}</label>
            <input 
              type="text" 
              id="search"
              placeholder={Array.isArray(t.searchPlaceholder) ? t.searchPlaceholder[0] : t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500" 
            />
          </div>

          {/* Filtre Prix */}
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.priceLimitLabel}</label>
            <input 
              type="range"
              id="price"
              min="5000"
              max="20000"
              step="1000"
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" // accent-orange-500 change la couleur du curseur
            />
            <div className="text-center font-semibold text-orange-600 mt-2">{priceLimit} FCFA</div>
          </div>

          {/* Filtre Genres/Valeurs (tags) avec cases à cocher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.valuesGenresLabel}</label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {allValues.map(v => (
                <label key={v.id} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={v.name_fr}
                    checked={selectedTags.includes(v.name_fr || '')}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTags(prev => [...prev, v.name_fr || '']);
                      } else {
                        setSelectedTags(prev => prev.filter(tag => tag !== (v.name_fr || '')));
                      }
                    }}
                    className="accent-orange-500"
                  />
                  <span>{v[`name_${lang}`] || v.name_fr}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Grille des Livres Filtrés avec BookGrid (mêmes modales et boutons que l'accueil) */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : (
            <BookGrid books={filteredBooks} />
          )}
        </main>
      </div>
    </div>
  );
}