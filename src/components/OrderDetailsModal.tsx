// Fichier : src/components/OrderDetailsModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react'; // Icône pour fermer
// Correction Next.js : configurer le worker manuellement
// Types (doivent correspondre au type Order dans CartItem.tsx)
type BookInfo = { title: string; description: string; coverImage: string; price: number; pdfUrl?: string | null; };
type ValueInfo = { id: number; name: string; };
type CharacterInfo = { name: string; relationshipToHero: string; animalType?: string | null; sex?: string | null; age?: string | null; photoUrl?: string | null; };
type Order = { 
  id: number; 
  childName: string; 
  childPhotoUrl: string | null; 
  book: BookInfo | null; 
  selectedValues: ValueInfo[];
  status: string; 
  createdAt: Date; 
  deliveryAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  paymentDetails?: string | null;
  userFullName?: string | null;
  userPhoneNumber?: string | null;
  heroAgeRange?: string | null;
  mainTheme?: string | null;
  storyLocation?: string | null;
  residentialArea?: string | null;
  packType?: string | null;
  bookLanguages?: string[] | null;
  messageSpecial?: string | null;
  characters?: CharacterInfo[]; // Nouvelle pour les personnages
};

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  // Tous les hooks sont ici

  // Juste avant le return principal :
  if (!order) return null;

  useEffect(() => {
    let isMounted = true;
    if (showPdf && order?.book?.pdfUrl) {
      setLoadingPdf(true);
      setPageImages([]);
      import('pdfjs-dist').then(async (pdfjsLib) => {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
        const pdf = await pdfjsLib.getDocument(order.book.pdfUrl).promise;
        if (!isMounted) return;
        setNumPages(pdf.numPages);
        const images: string[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL());
        }
        if (isMounted) {
          setPageImages(images);
          setLoadingPdf(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [showPdf, order?.book?.pdfUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6">Détails de la Commande #{order.id}</h2>

        <div className="space-y-4 text-gray-800 dark:text-gray-200 text-sm">
          {/* Section Livre et Enfant */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="font-bold text-base mb-2">Livre & Héros</h3>
            <div className="flex items-center gap-4">
              {order.book && (
                <div className="relative w-16 h-20 flex-shrink-0">
                  <Image src={order.book.coverImage} alt={order.book.title} fill objectFit="cover" className="rounded-md" />
                </div>
              )}
              <div>
                <p><strong>Titre:</strong> {order.book?.title}</p>
                <p><strong>Pour:</strong> {order.childName}</p>
                {order.heroAgeRange && <p><strong>Âge du héros:</strong> {order.heroAgeRange}</p>}
              </div>
            </div>
            {order.childPhotoUrl && (
              <div className="mt-2 text-center">
                <Image src={order.childPhotoUrl} alt="Photo de l'enfant" width={80} height={80} className="rounded-full object-cover mx-auto" />
              </div>
            )}
          </div>

          {/* Section Personnages Secondaires */}
          {order.characters && order.characters.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-bold text-base mb-2">Personnages Secondaires</h3>
              <div className="space-y-2">
                {order.characters.map((char, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {char.photoUrl && <Image src={char.photoUrl} alt={char.name} width={40} height={40} className="rounded-full object-cover" />}
                    <p>{char.name} (<span className="italic">{char.relationshipToHero}</span>)</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Valeurs et Thèmes */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="font-bold text-base mb-2">Valeurs & Thèmes</h3>
            <p><strong>Thème principal:</strong> {order.mainTheme || 'Non spécifié'}</p>
            {(order.selectedValues?.length ?? 0) > 0 && (
              <p><strong>Valeurs:</strong> {order.selectedValues!.map(v => v.name).join(', ')}</p>
            )}
            {order.storyLocation && <p><strong>Lieu de l'histoire:</strong> {order.storyLocation}</p>}
            {order.residentialArea && <p><strong>Zone de résidence:</strong> {order.residentialArea}</p>}
          </div>

          {/* Section Livraison */}
          {order.deliveryAddress && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-bold text-base mb-2">Livraison</h3>
              <p><strong>Adresse:</strong> {order.deliveryAddress}</p>
              <p><strong>Ville:</strong> {order.city}, {order.postalCode} {order.country}</p>
              <p><strong>Téléphone:</strong> {order.userPhoneNumber}</p>
            </div>
          )}

          {/* Section Paiement & Statut */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="font-bold text-base mb-2">Paiement & Statut</h3>
            <p><strong>Méthode:</strong> {order.paymentMethod || 'Non spécifié'}</p>
            {order.paymentDetails && <p><strong>Détails:</strong> {order.paymentDetails}</p>}
            <p><strong>Statut:</strong> {order.status}</p>
            <p><strong>Date de commande:</strong> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        {/* Bouton pour voir le PDF si disponible */}
        {order.book?.pdfUrl && (
          <div className="flex justify-center my-6">
            <button
              onClick={() => setShowPdf(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors"
            >
              Voir le livre PDF
            </button>
          </div>
        )}
        <div className="flex justify-center mt-6">
          <button onClick={onClose} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">
            Fermer
          </button>
        </div>
        {/* Modal PDF sécurisé (images) */}
        {showPdf && order.book?.pdfUrl && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 sm:mx-8 p-4 relative flex flex-col">
              <button
                onClick={() => setShowPdf(false)}
                className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                aria-label="Fermer"
              >
                &times;
              </button>
              <div className="w-full h-[70vh] relative overflow-y-auto" ref={pdfContainerRef}>
                {/* Overlay CSS pour bloquer le clic droit et impression */}
                <style>{`
                  .no-print { display: block !important; }
                  @media print { .no-print, .no-print * { display: none !important; } }
                `}</style>
                <div
                  className="absolute inset-0 z-10 no-print"
                  style={{ pointerEvents: 'auto' }}
                  onContextMenu={e => e.preventDefault()}
                />
                {loadingPdf ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Chargement du livre...</div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {pageImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Page ${idx + 1}`} className="rounded shadow max-w-full select-none pointer-events-none" draggable={false} />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-center text-gray-500 mt-2 text-sm">Lecture seule, téléchargement et impression désactivés.</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}