// Fichier : src/app/nouveautes/page.tsx
'use client'; // Ce composant est interactif

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify'; // Importe les notifications toast

import AnimateOnScroll from '@/components/AnimateOnScroll'; // Pour les animations d'entrée
import BookCardSkeleton from '@/components/BookCardSkeleton'; // Pour l'état de chargement

// --- Types ---
type Book = {
  id: number;
  title: string;
  shortDescription: string;
  coverImage: string;
  price: number;
  createdAt: string; // Important pour la date d'ajout
};

export default function NouveautesPage() {
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNewBooks() {
      setIsLoading(true);
      try {
        // Appelle l'API /api/books en demandant un tri par date de création descendante
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/books?sortBy=createdAt&order=desc`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Échec de la récupération des nouveautés.");
        
        setNewBooks(await res.json());
      } catch (error) {
        console.error("Erreur lors du chargement des nouveautés :", error);
        toast.error("Impossible de charger les dernières nouveautés.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNewBooks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">Dernières Nouveautés</h1>
      <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12">
        Découvrez les livres fraîchement ajoutés à notre collection.
      </p>

      {isLoading ? ( // Affiche des skeletons pendant le chargement
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : newBooks.length > 0 ? ( // Affiche les livres si disponibles
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newBooks.map((book, index) => (
            <AnimateOnScroll key={book.id} delay={index * 0.1}> {/* Animation d'entrée pour chaque livre */}
              <Link href={`/personaliser/${book.id}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative w-full h-48">
                  <Image src="/Livre.jpeg" alt={book.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{book.shortDescription}</p>
                  {/* Affichage de la date d'ajout */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ajouté le: {new Date(book.createdAt).toLocaleDateString('fr-FR')}</p>
                  <div className="mt-3 text-orange-500 font-semibold">{book.price} FCFA</div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      ) : ( // Message si aucune nouveauté
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">Aucune nouveauté à afficher pour le moment.</p>
      )}
    </div>
  );
}