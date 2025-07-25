// Fichier : src/app/panier/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

// Import des types depuis le fichier centralisé
import { Order, BookInfo, ValueInfo, CharacterInfo } from '@/types/app.d'; 

import { useCartStore } from '@/store/cartStore';
import PaymentModal from '@/components/PaymentModal';
import CartItem from '@/components/CartItem';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

// Ajoute ce type utilitaire juste après les imports :
type OrderWithType = Order & { _type?: 'PERSONALIZED' | 'STANDARD' };

export default function CartPage() {
  const [orders, setOrders] = useState<OrderWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  // const { decrement: decrementCartCount } = useCartStore();

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
  const currentUser = session?.user || phoneUser;

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      let cartUrl = '/api/cart-orders?';
      let persUrl = '/api/orders?';
      if (currentUser?.id) {
        cartUrl += `userId=${currentUser.id}`;
        persUrl += `userId=${currentUser.id}`;
      } else {
        let guestToken = localStorage.getItem('guestToken');
        if (!guestToken) { setOrders([]); setIsLoading(false); return; }
        cartUrl += `guestToken=${guestToken}`;
        persUrl += `guestToken=${guestToken}`;
      }
      
      // Ajouter le filtre pour ne récupérer que les commandes non payées
      cartUrl += '&status=IN_CART';
      persUrl += '&status=IN_CART';
      
      const [cartRes, persRes] = await Promise.all([fetch(cartUrl), fetch(persUrl)]);
      let allOrders: any[] = [];
      if (cartRes.ok) {
        const cartOrders = await cartRes.json();
        allOrders = allOrders.concat(cartOrders.map((o: any) => ({ ...o, _type: 'STANDARD' as const })));
      }
      if (persRes.ok) {
        const persOrders = await persRes.json();
        allOrders = allOrders.concat(persOrders.map((o: any) => ({ ...o, _type: 'PERSONALIZED' as const })));
      }
      setOrders(allOrders);
    } catch (error) { toast.error("Impossible de charger le panier."); } 
    finally { setIsLoading(false); }
  }, [isAuthenticated, currentUser]);

  // Redirection si non authentifié (côté client) - avec délai pour éviter les redirections intempestives
  useEffect(() => {
    // Attendre un peu avant de vérifier l'authentification
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
      
      // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
      if (!isAuthenticated && sessionStatus === 'unauthenticated' && !phoneUser) {
        console.log('Panier - Redirecting to login, not authenticated');
        router.push('/connexion?callbackUrl=/panier');
      }
    }, 2000); // Délai de 2 secondes pour laisser le temps à l'auth téléphone

    return () => clearTimeout(timer);
  }, [isAuthenticated, sessionStatus, router, phoneUser]);

  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (!hasCheckedAuth) return;
    
    if (sessionStatus === 'loading') return;
    
    // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
    if (!isAuthenticated && sessionStatus === 'unauthenticated' && !phoneUser) {
      router.push('/connexion?callbackUrl=/panier');
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, sessionStatus, hasCheckedAuth, phoneUser, fetchOrders]);

  // --- NOUVELLE FONCTION POUR OUVRIR LE MODAL DE DÉTAILS ---
  // Déplacée ici pour la portée et l'ajout aux dépendances
  const handleViewOrderDetails = useCallback((order: Order) => {
    setSelectedOrderForDetails(order);
    setIsOrderDetailsModalOpen(true);
  }, []); // C'est un useCallback sans dépendance car il ne dépend que de setSelectedOrderForDetails et setIsOrderDetailsModalOpen qui sont des setters d'état stables

  const handleDelete = useCallback(async (orderId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    setIsProcessingAction(true);
    const originalOrders = orders;
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    // decrementCartCount(); // plus nécessaire
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("La suppression a échoué.");
      toast.success("Article supprimé avec succès.");
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression : ${error.message}. Restauration du panier.`);
      setOrders(originalOrders);
    } finally { setIsProcessingAction(false); }
  }, [orders]); // <-- handleViewOrderDetails n'est PAS une dépendance de handleDelete

  const handleOpenPaymentModal = () => {
    if (orders.length === 0) {
      toast.warn("Votre panier est vide !");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => { fetchOrders(); };

  const calculateTotal = () => orders.reduce((total, order) => {
    if (order._type === 'PERSONALIZED') {
      return total + (order.calculatedPrice || 0);
    } else {
      return total + (order.book?.price || 0);
    }
  }, 0);
  
  // Afficher un loader pendant la vérification ou le chargement
  if (!hasCheckedAuth || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Chargement de votre panier...</p>
        </div>
      </div>
    );
  }

  // Afficher un message de connexion si non authentifié (au lieu de rediriger immédiatement)
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.yourCart}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{t.pleaseLogin}</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/connexion?callbackUrl=/panier')} 
              className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t.login}
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="w-full bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t.backToHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">{t.yourCart}</h1>
      {orders.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id + '-' + order._type}
                className={`relative rounded-xl shadow-lg mb-6 p-4 border-2 ${order._type === 'PERSONALIZED' ? 'bg-orange-50 border-orange-300' : 'bg-white border-orange-100 dark:bg-gray-800 dark:border-gray-700'}`}
              >
                <CartItem
                  order={order}
                  onDelete={async (orderId: number) => {
                    setIsProcessingAction(true);
                    const originalOrders = orders;
                    setOrders((prev) => prev.filter((o) => o.id !== orderId || o._type !== order._type));
                    try {
                      if (order._type === 'PERSONALIZED') {
                        const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error("La suppression a échoué.");
                      } else {
                        // Suppression pour CartOrder : on utilise DELETE sur /api/cart-orders avec l'id dans le body
                        let deleteUrl = `/api/cart-orders?id=${orderId}`;
                        if (session?.user?.id) {
                          deleteUrl += `&userId=${session.user.id}`;
                        } else {
                          const guestToken = localStorage.getItem('guestToken');
                          if (guestToken) {
                            deleteUrl += `&guestToken=${guestToken}`;
                          }
                        }
                        console.log('Suppression commande standard - URL:', deleteUrl);
                        const res = await fetch(deleteUrl, { method: 'DELETE' });
                        console.log('Réponse suppression:', res.status, res.statusText);
                        if (!res.ok) throw new Error("La suppression a échoué.");
                      }
                    } catch (error: any) {
                      setOrders(originalOrders);
                    } finally { setIsProcessingAction(false); }
                  }}
                  isProcessingAction={isProcessingAction}
                  onViewDetails={handleViewOrderDetails}
                />
                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${order._type === 'PERSONALIZED' ? 'bg-orange-300 text-orange-900' : 'bg-orange-100 text-orange-700'}`}>
                  {order._type === 'PERSONALIZED' ? 'Personnalisé' : 'Standard'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-end">
            <div className="text-right text-gray-800 dark:text-gray-200">
              <p className="text-2xl">Total : <span className="font-bold">{calculateTotal()} FCFA</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.readyToFinalize}</p>
            </div>
            <button
              onClick={handleOpenPaymentModal}
              disabled={isProcessingAction}
              className="mt-4 relative bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 text-white font-bold py-3 px-12 rounded-full shadow-2xl border-2 border-orange-400 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-400/60 hover:scale-105 hover:ring-4 hover:ring-orange-200 transition-all duration-200 flex flex-col items-center gap-1 text-lg disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:animate-bounce"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25v7.5A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0019.5 6h-15A2.25 2.25 0 002.25 8.25z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 9.75h19.5m-16.5 3h.008v.008h-.008v-.008zm3 0h.008v.008h-.008v-.008z" />
                </svg>
                {t.proceedToPayment}
              </span>
              <span className="text-xs text-orange-100 font-normal tracking-wide mt-1 drop-shadow-sm">
                Paiement sécurisé
              </span>
              <span className="absolute inset-0 rounded-full pointer-events-none group-hover:shadow-[0_0_24px_8px_rgba(255,140,0,0.25)] transition-all duration-200"></span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-xl text-gray-500 dark:text-gray-400">{t.noBooks}</p>
          <Link href="/livres" className="mt-4 inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600">
            {t.books}
          </Link>
        </div>
      )}
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        orderIds={orders.map(order => ({ id: order.id, type: order._type! }))}
        onPaymentSuccess={handlePaymentSuccess} 
      />

      {isOrderDetailsModalOpen && selectedOrderForDetails && (
        <OrderDetailsModal 
          isOpen={true} 
          onClose={() => setIsOrderDetailsModalOpen(false)} 
          order={selectedOrderForDetails} 
        />
      )}
    </div>
  );
}