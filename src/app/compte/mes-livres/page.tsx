// Fichier : src/app/compte/mes-livres/page.tsx
'use client'; // Ce composant est interactif
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react'; // Imports nécessaires
import Image from 'next/image';
import Link from 'next/link';

import { useSession } from 'next-auth/react'; // Pour le client-side
import { toast } from 'react-toastify';
import { User as UserIcon, LogOut, BookText, BarChart } from 'lucide-react'; // Pour les icônes
import { Order, BookInfo, ValueInfo, CharacterInfo } from '@/types/app.d'; // Types centralisés
import { useCartStore } from '@/store/cartStore'; // Ajout de l'import

// Ajout du type CartOrder pour l'affichage
interface CartOrder {
  id: number;
  book: BookInfo;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyPersonalizedBooksPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [cartOrders, setCartOrders] = useState<CartOrder[]>([]); // Nouvel état pour les commandes non personnalisées
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [generatingOrderId, setGeneratingOrderId] = useState<number | null>(null); // Pour suivre l'ID en cours de génération
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const { toggleCart } = useCartStore(); // Ajout de toggleCart

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
  const router = useRouter();
  useEffect(() => {
    // Attendre un peu avant de vérifier l'authentification
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
      
      // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
      if (!isAuthenticated && sessionStatus === 'unauthenticated' && !phoneUser) {
        console.log('MesLivres - Redirecting to login, not authenticated');
        router.push('/connexion?callbackUrl=/compte/mes-livres');
      }
    }, 2000); // Délai de 2 secondes pour laisser le temps à l'auth téléphone

    return () => clearTimeout(timer);
  }, [isAuthenticated, sessionStatus, router, phoneUser]);

  // Déclarer fetchUserOrders et fetchCartOrders AVANT le useEffect qui les utilise
  const fetchUserOrders = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) return; // Ne charge pas si non connecté ou pas d'id
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}&status=all`); // Passe userId et status=all
      if (!res.ok) throw new Error("Erreur lors du chargement des commandes.");
      const data: Order[] = await res.json();
      setUserOrders(data);
    } catch (error) { toast.error("Impossible de charger vos livres personnels."); }
    finally { setIsLoadingOrders(false); }
  }, [isAuthenticated, currentUser]);

  // Ajout de la récupération des commandes non personnalisées
  const fetchCartOrders = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) return;
    try {
      const res = await fetch(`/api/cart-orders?userId=${currentUser.id}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des commandes standard.');
      const data: CartOrder[] = await res.json();
      setCartOrders(data);
    } catch (error) {
      toast.error('Impossible de charger vos commandes standard.');
    }
  }, [isAuthenticated, currentUser]);

  // useEffect qui utilise fetchUserOrders et fetchCartOrders
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (!hasCheckedAuth) return;
    
    if (sessionStatus === 'loading') return;
    
    // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
    if (!isAuthenticated && sessionStatus === 'unauthenticated' && !phoneUser) {
      router.push('/connexion?callbackUrl=/compte/mes-livres');
      return;
    }

    if (isAuthenticated) {
      fetchUserOrders();
      fetchCartOrders();
    }
  }, [isAuthenticated, sessionStatus, hasCheckedAuth, phoneUser, fetchUserOrders, fetchCartOrders]);

  // Gère la génération de contenu IA
  const handleGenerateContent = async (orderId: number) => {
    if (generatingOrderId === orderId) return; // Empêche les clics multiples
    setGeneratingOrderId(orderId); // Active le loader pour cette commande
    toast.info("Génération du livre en cours, cela peut prendre quelques instants...");
    try {
      const res = await fetch('/api/generate-book-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de la génération du contenu.');
      }
      
      toast.success("Livre généré avec succès ! Vous pouvez maintenant le lire.");
      fetchUserOrders(); // Rafraîchit la liste des commandes pour afficher le contenu généré
    } catch (error: any) {
      toast.error(`Erreur de génération : ${error.message}`);
    } finally {
      setGeneratingOrderId(null); // Désactive le loader
    }
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'PENDING': return 'bg-gray-400';
          case 'IN_CART': return 'bg-orange-400'; // Nouvelle couleur pour IN_CART
          case 'COMPLETED': return 'bg-green-600';
          case 'CANCELLED': return 'bg-red-600';
          default: return 'bg-gray-400';
      }
  };

  // Afficher un loader pendant la vérification ou le chargement
  if (!hasCheckedAuth || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Chargement de vos livres personnels...</p>
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
      <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mes Livres Personnels</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
              Retrouvez ici tous les livres que vous avez personnalisés.
          </p>
      </header>

      {/* Section Livres personnalisés */}
      <section className="mb-12">
          {userOrders.length > 0 ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                  {userOrders.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md items-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                          <div className="relative w-24 h-32 mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                              {order.book && <Image src={order.book.coverImage || '/Livre.jpeg'} alt={order.book.title} fill className="object-cover rounded-md" />}
                          </div>
                          <div className="flex-grow text-center sm:text-left">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{order.book?.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300">Pour : <span className="font-semibold text-orange-500">{order.childName}</span></p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Date : {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                              
                              {/* Affichage du statut de la commande */}
                              <div className="flex items-center mt-2 justify-center sm:justify-start">
                                  <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${getStatusColor(order.status)}`}>
                                      {order.status === 'IN_CART' ? 'Dans le panier' : order.status === 'PENDING' ? 'En attente' : order.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                                  </span>
                              </div>

                              {/* Boutons d'action : Générer ou Lire */}
                              <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
                                  {order.status === 'COMPLETED' && !order.generatedContent ? (
                                      // Bouton Générer si la commande est COMPLETED mais le contenu non généré
                                      <button
                                          onClick={() => handleGenerateContent(order.id)}
                                          disabled={generatingOrderId === order.id}
                                          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                      >
                                          {generatingOrderId === order.id ? 'Génération...' : 'Générer le livre'}
                                      </button>
                                  ) : order.status === 'COMPLETED' && order.generatedContent ? (
                                      // Bouton Lire si la commande est COMPLETED et le contenu est généré
                                      <Link 
                                          href={`/compte/mes-livres/read/${order.id}`} 
                                          className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 text-sm text-center"
                                      >
                                          Lire le livre
                                      </Link>
                                  ) : order.status === 'IN_CART' ? (
                                      // Bouton vers le panier si IN_CART
                                      <button 
                                          onClick={toggleCart}
                                          className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 text-sm text-center"
                                      >
                                          Aller au panier
                                      </button>
                                  ) : (
                                      // Autre statut, ex: Annulé
                                      <span className="text-gray-500 text-sm italic">Action non disponible</span>
                                  )}
                              </div>

                              {/* Barre de progression de lecture (pour les commandes COMPLETED) */}
                              {order.status === 'COMPLETED' && (
                                  <div className="mt-4 w-full">
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progression de lecture : {order.readProgress}%</p>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                          <div 
                                              className="bg-blue-500 h-2.5 rounded-full" 
                                              style={{ width: `${order.readProgress}%` }}
                                          ></div>
                                      </div>
                                  </div>
                              )}
                          </div>
                          {order.childPhotoUrl && (
                              <div className="relative w-16 h-16 rounded-full overflow-hidden ml-0 sm:ml-4 flex-shrink-0">
                                  <Image src={order.childPhotoUrl} alt={`Photo de ${order.childName}`} fill className="object-cover" />
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                  <p className="text-xl text-gray-500 dark:text-gray-400">Vous n'avez pas encore personnalisé de livres.</p>
                  <Link href="/livres" className="mt-4 inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600">
                      Commencer à personnaliser
                  </Link>
              </div>
          )}
      </section>

      {/* Section Livres standards (non personnalisés) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mes Livres Standards</h2>
        {cartOrders.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {cartOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md items-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="relative w-24 h-32 mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                  {order.book && <Image src={order.book.coverImage || '/Livre.jpeg'} alt={order.book.title} fill className="object-cover rounded-md" />}
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{order.book?.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Quantité : <span className="font-semibold text-orange-500">{order.quantity}</span></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date : {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                  <div className="flex items-center mt-2 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold bg-orange-400">
                      Standard
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
                    <button onClick={toggleCart} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 text-sm text-center">
                      Voir dans le panier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-xl text-gray-500 dark:text-gray-400">Vous n'avez pas encore de livres standards dans votre panier.</p>
            <Link href="/livres" className="mt-4 inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600">
              Découvrir les livres
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}