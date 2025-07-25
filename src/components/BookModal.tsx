import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // Pour la session (si nécessaire, pas utilisé directement pour le token ici)
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-toastify';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export type Book = {
  id: number;
  title: string;
  shortDescription?: string;
  description?: string;
  coverImage: string;
  price: number;
  pdfUrl?: string;
};

type BookModalProps = {
  open: boolean;
  onClose: () => void;
  book: Book | null;
};

export default function BookModal({ open, onClose, book }: BookModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [showPdf, setShowPdf] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { toggleCart, addItem, setItems } = useCartStore();
  const { data: session, status } = useSession(); // Juste pour info, non utilisé pour auth token ici
  const router = useRouter();
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  // Vérifier l'authentification par téléphone
  useEffect(() => {
    const checkPhoneAuth = () => {
      const phoneAuth = localStorage.getItem('phoneAuth');
      if (phoneAuth) {
        try {
          const userData = JSON.parse(phoneAuth);
          setPhoneUser(userData);
        } catch (error) {
          console.error('Erreur parsing phoneAuth:', error);
          localStorage.removeItem('phoneAuth');
        }
      }
    };

    checkPhoneAuth();
    window.addEventListener('phone-auth-updated', checkPhoneAuth);
    
    return () => {
      window.removeEventListener('phone-auth-updated', checkPhoneAuth);
    };
  }, []);

  // Utilisateur connecté (par NextAuth ou par téléphone)
  const isAuthenticated = session || phoneUser;

  // Tous les hooks sont ici

  // Juste avant le return principal :
  if (!book) {
    return null;
  }

  const refreshCartFromDB = async (userId: string | null, guestToken: string | null) => {
    try {
      let url = '';
      if (userId) {
        url = `/api/cart-orders?phoneUserId=${userId}`;
      } else if (guestToken) {
        url = `/api/cart-orders?guestToken=${guestToken}`;
      } else {
        setItems([]);
        return;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const cartItems = data.map((order: any) => ({
            bookId: order.bookId,
            title: order.book.title,
            price: order.book.price,
            coverImage: order.book.coverImage,
            quantity: order.quantity
          }));
          setItems(cartItems);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du panier:', error);
    }
  };

  const handleAddToCart = async () => {
    console.log('BookModal - handleAddToCart called with book:', book);
    console.log('BookModal - isAuthenticated:', isAuthenticated);
    console.log('BookModal - session:', session);
    console.log('BookModal - phoneUser:', phoneUser);
    
    // Génère ou récupère le guestToken pour les invités
    let guestToken = null;
    let phoneUserId = null;
    if (!isAuthenticated) {
      guestToken = localStorage.getItem('guestToken');
      if (!guestToken) {
        guestToken = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        localStorage.setItem('guestToken', guestToken);
      }
      console.log('BookModal - Using guestToken:', guestToken);
    } else if (phoneUser) {
      phoneUserId = phoneUser.id;
      console.log('BookModal - Using phoneUserId:', phoneUserId);
    } else if (session) {
      console.log('BookModal - Using session user');
    }
    
    try {
      const body = isAuthenticated
        ? { bookId: book.id, quantity, phoneUserId }
        : { bookId: book.id, quantity, guestToken };
      
      console.log('BookModal - Request body:', body);
      
      const res = await fetch('/api/cart-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      console.log('BookModal - Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('BookModal - Error response:', errorText);
        throw new Error('Erreur lors de l\'ajout au panier');
      }
      
      // Rafraîchir le panier depuis l'API pour synchroniser SideCart + navbar
      await refreshCartFromDB(phoneUserId, guestToken);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Ajouté au panier !');
      onClose();
      toggleCart();
    } catch (e: any) {
      console.error('BookModal - Error in handleAddToCart:', e);
      toast.error(e.message || 'Erreur');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (showPdf && book?.pdfUrl) {
      setLoadingPdf(true);
      setPageImages([]);
      import('pdfjs-dist').then(async (pdfjsLib) => {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
        const pdf = await pdfjsLib.getDocument(book.pdfUrl!).promise;
        if (!isMounted) return;
        setNumPages(pdf.numPages);
        const images: string[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
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
  }, [showPdf, book?.pdfUrl]);

  // Pour éviter les erreurs de typage, forcer la conversion en string :
  const closeLabel = Array.isArray(t.close) ? t.close[0] : t.close;
  const decreaseQuantityLabel = Array.isArray(t.decreaseQuantity) ? t.decreaseQuantity[0] : t.decreaseQuantity;
  const increaseQuantityLabel = Array.isArray(t.increaseQuantity) ? t.increaseQuantity[0] : t.increaseQuantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 sm:mx-8 p-6 relative flex flex-col md:flex-row gap-8 animate-fadeIn">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
          aria-label={closeLabel}
        >
          &times;
        </button>
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-72 md:h-96 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={book.coverImage || '/Livre.jpeg'}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: 'cover', color: 'transparent' }}
            className="rounded-xl"
          />
        </div>
        {/* Infos */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h2>
          <div className="text-lg text-orange-500 font-semibold mb-4">{book.price} FCFA</div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {book.description || book.shortDescription || t.noDescription}
          </p>
          {/* Quantité et bouton */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={decreaseQuantityLabel}
            >-</button>
            <span className="w-8 text-center font-semibold text-lg">{quantity.toString().padStart(2, '0')}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={increaseQuantityLabel}
            >+</button>
          </div>
          <button
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors w-full"
            onClick={handleAddToCart}
          >
            {t.addToCart}
          </button>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href={`/personaliser/${book.id}`}
              className="flex-1 block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              {t.customizeBook}
            </Link>
          </div>
        </div>
      </div>
      {/* Modal PDF (images) */}
      {showPdf && book.pdfUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 sm:mx-8 p-4 relative flex flex-col">
            <button
              onClick={() => setShowPdf(false)}
              className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
              aria-label={closeLabel}
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
                <div className="flex items-center justify-center h-full text-gray-500">
                  {t.loadingBook}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {pageImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Page ${idx + 1}`} className="rounded shadow max-w-full select-none pointer-events-none" draggable={false} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-center text-gray-500 mt-2 text-sm">
              {t.readOnly}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 