import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import BookModal, { Book } from './BookModal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-toastify';

// Icônes SVG inline (œil, panier, favoris)
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addItem, setItems } = useCartStore();
  const [phoneUser, setPhoneUser] = useState<any>(null);

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

  // À remplacer par ta logique panier réelle
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

  const addToCart = async (book: Book) => {
    console.log('BookGrid - addToCart called with book:', book);
    console.log('BookGrid - isAuthenticated:', isAuthenticated);
    console.log('BookGrid - session:', session);
    console.log('BookGrid - phoneUser:', phoneUser);
    
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
      console.log('BookGrid - Using guestToken:', guestToken);
    } else if (phoneUser) {
      phoneUserId = phoneUser.id;
      console.log('BookGrid - Using phoneUserId:', phoneUserId);
    } else if (session) {
      console.log('BookGrid - Using session user');
    }
    
    try {
      const body = isAuthenticated
        ? { bookId: book.id, quantity: 1, phoneUserId }
        : { bookId: book.id, quantity: 1, guestToken };
      
      console.log('BookGrid - Request body:', body);
      
      const res = await fetch('/api/cart-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      console.log('BookGrid - Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('BookGrid - Error response:', errorText);
        throw new Error('Erreur lors de l\'ajout au panier');
      }
      
      // Rafraîchir le panier depuis l'API pour synchroniser SideCart + navbar
      await refreshCartFromDB(phoneUserId, guestToken);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Ajouté au panier !');
    } catch (e: any) {
      console.error('BookGrid - Error in addToCart:', e);
      toast.error(e.message || 'Erreur');
    }
  };

  const openModal = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedBook(null), 300);
  };

  // Passe addItem au BookModal si besoin
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {books.map((book) => (
          <div
            key={book.id}
            className="group bg-white dark:bg-gray-800  shadow-lg overflow-hidden flex flex-col items-center transition-all duration-300 hover:shadow-2xl"
          >
            <div className="relative w-full flex justify-center pt-[125%] bg-gradient-to-b from-orange-50 to-white">
              {/* Image aspect livre, bord carré, prend toute la largeur */}
              <div className="absolute top-0 left-0 w-full h-full shadow-xl overflow-hidden border-2 border-orange-100 dark:border-gray-700">
                <Image
                  src={book.coverImage || '/Livre.jpeg'}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{  color: 'transparent' }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay d'icônes */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                  <button
                    onClick={e => { e.stopPropagation(); openModal(book); }}
                    className="bg-white/90 dark:bg-gray-900/90 rounded-lg p-2 shadow hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                    aria-label="Voir le livre"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(book); }}
                    className="bg-white/90 dark:bg-gray-900/90 rounded-lg p-2 shadow hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                    aria-label="Ajouter au panier"
                  >
                    <CartIcon />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); /* favoris à brancher */ }}
                    className="bg-white/90 dark:bg-gray-900/90 rounded-lg p-2 shadow hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                    aria-label="Ajouter aux favoris"
                  >
                    <HeartIcon />
                  </button>
                </div>
              </div>
            </div>
            {/* Infos livre */}
            <div className="pt-4 pb-2 px-2 flex flex-col items-center w-full">
              <h3 className="text-base font-bold truncate text-gray-900 dark:text-white text-center mb-1">{book.title}</h3>
              <span className="text-orange-500 font-semibold text-lg">{book.price} FCFA</span>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && selectedBook && (
        <BookModal open={true} onClose={closeModal} book={selectedBook} />
      )}
    </>
  );
} 