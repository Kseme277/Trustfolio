'use client';
export const dynamic = "force-dynamic";
// Fichier : src/app/compte/page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import PaymentModal from '@/components/PaymentModal';
import { Trash2 } from 'lucide-react'; // Import de l'icône poubelle

// Types
type BookInfo = { title: string; coverImage: string; price: number; };
type ValueInfo = { id: number; name: string; };
type Order = { 
  id: number; 
  childName: string; 
  childPhotoUrl: string | null; 
  book: BookInfo | null; 
  selectedValues: ValueInfo[];
  status: string; 
  createdAt: Date;
  calculatedPrice?: number;
  packType?: string;
  mainTheme?: string;
  _type?: 'STANDARD' | 'PERSONALIZED'; // Added for new format
};

export default function AccountPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderIdsToPay, setOrderIdsToPay] = useState<{ id: number; type: 'PERSONALIZED' | 'STANDARD' }[]>([]);
  const [userPendingOrders, setUserPendingOrders] = useState<Order[]>([]);
  const [userAllOrders, setUserAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

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

  // Redirection si non authentifié (côté client) - avec délai pour éviter les redirections intempestives
  useEffect(() => {
    // Attendre un peu avant de vérifier l'authentification
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
      
      // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
      if (!isAuthenticated && sessionStatus === 'unauthenticated' && !phoneUser) {
        console.log('Compte - Redirecting to login, not authenticated');
        router.push('/connexion?callbackUrl=/compte');
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
      router.push('/connexion?callbackUrl=/compte');
      return;
    }

    if (isAuthenticated) {
      const payOrdersParam = searchParams.get('payOrders');
      
      if (payOrdersParam) {
        try {
          // Essayer de parser comme JSON pour le nouveau format
          const parsedOrders = JSON.parse(payOrdersParam);
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            setOrderIdsToPay(parsedOrders);
            setIsPaymentModalOpen(true);
          } else {
            // Fallback pour l'ancien format (IDs simples)
            const ids = payOrdersParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
            if (ids.length > 0) {
              // Convertir en format personnalisé
              const personalizedOrders = ids.map(id => ({ id, type: 'PERSONALIZED' as 'PERSONALIZED' }));
              setOrderIdsToPay(personalizedOrders);
              setIsPaymentModalOpen(true);
            } else {
              toast.error("IDs de commande invalides pour le paiement.");
              router.replace('/compte');
            }
          }
        } catch (error) {
          // Fallback pour l'ancien format (IDs simples)
          const ids = payOrdersParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
          if (ids.length > 0) {
            // Convertir en format personnalisé
            const personalizedOrders = ids.map(id => ({ id, type: 'PERSONALIZED' as 'PERSONALIZED' }));
            setOrderIdsToPay(personalizedOrders);
            setIsPaymentModalOpen(true);
          } else {
            toast.error("IDs de commande invalides pour le paiement.");
            router.replace('/compte');
          }
        }
      } else {
        fetchUserOrders();
      }
    }
  }, [isAuthenticated, sessionStatus, searchParams, router, phoneUser, hasCheckedAuth]);

  const fetchUserOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Récupérer toutes les commandes de l'utilisateur (personnalisées + standard)
      let ordersUrl = '/api/orders?includeCartOrders=true';
      
      // Ajouter le paramètre d'authentification approprié
      if (phoneUser?.id) {
        ordersUrl += `&phoneUserId=${phoneUser.id}`;
      } else if (session?.user?.id) {
        ordersUrl += `&userId=${session.user.id}`;
      }
      
      const allOrdersRes = await fetch(ordersUrl);
      if (allOrdersRes.ok) {
        const allOrders = await allOrdersRes.json();
        setUserAllOrders(allOrders);
        
        // Filtrer les commandes en attente
        const pendingOrders = allOrders.filter((order: Order) => 
          order.status === 'PENDING' || order.status === 'IN_CART'
        );
        setUserPendingOrders(pendingOrders);
      }
    } catch (error) {
      console.error("Erreur de chargement des commandes:", error);
      toast.error("Impossible de charger vos commandes.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, phoneUser, session]);
  
  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setOrderIdsToPay([]);
    toast.success("Paiement effectué avec succès !");
    router.replace('/compte');
    fetchUserOrders();
  };

  const handlePayOrder = (order: Order) => {
    const orderToPay = { 
      id: order.id, 
      type: (order._type === 'STANDARD' ? 'STANDARD' : 'PERSONALIZED') as 'STANDARD' | 'PERSONALIZED'
    };
    setOrderIdsToPay([orderToPay]);
    setIsPaymentModalOpen(true);
  };

  const handlePayAllOrders = () => {
    const ordersToPay = userPendingOrders.map(order => ({ 
      id: order.id, 
      type: (order._type === 'STANDARD' ? 'STANDARD' : 'PERSONALIZED') as 'STANDARD' | 'PERSONALIZED'
    }));
    setOrderIdsToPay(ordersToPay);
    setIsPaymentModalOpen(true);
  };

  // Fonction pour supprimer une commande personnalisée
  const handleDeletePersonalizedOrder = async (orderId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour les listes locales
        setUserAllOrders(prev => prev.filter(order => order.id !== orderId));
        setUserPendingOrders(prev => prev.filter(order => order.id !== orderId));
        toast.success('Commande supprimée avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  // Fonction pour supprimer une commande standard (cart order)
  const handleDeleteStandardOrder = async (orderId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    
    try {
      const userId = currentUser?.id;
      const deleteUrl = `/api/cart-orders?id=${orderId}&phoneUserId=${userId}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour les listes locales
        setUserAllOrders(prev => prev.filter(order => order.id !== orderId));
        setUserPendingOrders(prev => prev.filter(order => order.id !== orderId));
        toast.success('Commande supprimée avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  // Fonction générique pour supprimer une commande
  const handleDeleteOrder = (order: Order) => {
    if (order._type === 'STANDARD') {
      handleDeleteStandardOrder(order.id);
    } else {
      handleDeletePersonalizedOrder(order.id);
    }
  };

  // Afficher un loader pendant la vérification ou le chargement
  if (!hasCheckedAuth || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Mon Profil</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Bonjour, <span className="font-semibold">{currentUser?.name || currentUser?.email || 'Utilisateur'}</span> !
        </p>
      </header>

      {/* Informations utilisateur */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 mb-4 sm:mb-6">
          Mes Informations
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nom</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{currentUser?.name || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-all">{currentUser?.email || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{currentUser?.phoneNumber || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Statut</p>
              <p className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">Connecté</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 mb-4 sm:mb-6">
          Mes Statistiques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500">{userAllOrders.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total des commandes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-500">
              {userAllOrders.filter(order => order.status === 'COMPLETED').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Commandes complétées</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-500">
              {userPendingOrders.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">En attente</div>
          </div>
        </div>
      </section>

      {/* Commandes en attente */}
      <section className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3">
            Commandes en Attente
          </h2>
          {userPendingOrders.length > 0 && (
            <button
              onClick={handlePayAllOrders}
              className="mt-3 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Payer toutes les commandes
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="text-center p-10 text-gray-600 dark:text-gray-300">Chargement...</div>
        ) : userPendingOrders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {userPendingOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="relative w-16 sm:w-20 h-20 sm:h-24 flex-shrink-0 mx-auto sm:mx-0">
                    {order.book && (
                      <Image 
                        src={order.book.coverImage || '/Livre.jpeg'} 
                        alt={order.book.title} 
                        fill 
                        style={{objectFit: "cover"}} 
                        className="rounded-md" 
                      />
                    )}
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{order.book?.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Pour : {order.childName}</p>
                    {order.packType && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Pack : {order.packType}</p>
                    )}
                    {order.mainTheme && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Thème : {order.mainTheme}</p>
                    )}
                    {order.calculatedPrice && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Prix : {order.calculatedPrice.toLocaleString()} FCFA</p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Date : {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        order.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {order.status === 'PENDING' ? 'En attente de paiement' : 'Dans le panier'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePayOrder(order)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Payer cette commande
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs transition-colors"
                          title="Supprimer cette commande"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left">Vous n'avez aucune commande en attente de paiement.</p>
        )}
      </section>

      {/* Toutes les commandes */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3 mb-4 sm:mb-6">
          Toutes Mes Commandes
        </h2>
        {isLoading ? (
          <div className="text-center p-10 text-gray-600 dark:text-gray-300">Chargement...</div>
        ) : userAllOrders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {userAllOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="relative w-16 h-20 flex-shrink-0 mx-auto sm:mx-0">
                    {order.book && (
                      <Image 
                        src={order.book.coverImage || '/Livre.jpeg'} 
                        alt={order.book.title} 
                        fill 
                        style={{objectFit: "cover"}} 
                        className="rounded-md" 
                      />
                    )}
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{order.book?.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Pour : {order.childName}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Date : {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center sm:text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        order.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Terminée' : 
                         order.status === 'PENDING' ? 'En attente' : 'Dans le panier'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs transition-colors"
                      title="Supprimer cette commande"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left">Vous n'avez pas encore de commandes.</p>
        )}
      </section>

      {/* Modal de paiement */}
      {isPaymentModalOpen && orderIdsToPay.length > 0 && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          orderIds={orderIdsToPay} 
          onPaymentSuccess={handlePaymentSuccess} 
        />
      )}
    </div>
  );
}