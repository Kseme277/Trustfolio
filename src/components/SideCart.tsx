// Fichier : src/components/SideCart.tsx
'use client'; // <-- Assurez-vous que cette ligne est bien présente

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { toast } from 'react-toastify';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import PersonalizedCartItem from './PersonalizedCartItem';

export default function SideCart() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isCartOpen, toggleCart, items, removeItem, updateQuantity, clear, setItems } = useCartStore();
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedOrders, setPersonalizedOrders] = useState<any[]>([]);

  // Debug: afficher les items dans la console
  useEffect(() => {
    console.log('SideCart - useEffect triggered');
    console.log('SideCart - items:', items);
    console.log('SideCart - isCartOpen:', isCartOpen);
  }, [items, isCartOpen]);

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

  // Charger les commandes personnalisées en plus du panier standard
  useEffect(() => {
    async function fetchPersonalizedOrders() {
      let userId = phoneUser?.id || session?.user?.id;
      let guestToken = null;
      if (!userId) {
        guestToken = localStorage.getItem('guestToken');
      }
      let url = '/api/orders?status=IN_CART';
      if (userId) url += `&userId=${userId}`;
      else if (guestToken) url += `&guestToken=${guestToken}`;
      else return;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPersonalizedOrders(data);
        }
      } catch (e) { /* ignore */ }
    }
    fetchPersonalizedOrders();
  }, [session, phoneUser, isCartOpen]);

  // Utilisateur connecté (par NextAuth ou par téléphone)
  const isAuthenticated = session || phoneUser;

  // Supprimer un article du panier
  const handleRemoveItem = async (bookId: number) => {
    let userId = phoneUser?.id || session?.user?.id;
    let guestToken = null;
    if (!userId) {
      guestToken = localStorage.getItem('guestToken');
      if (!guestToken) {
        toast.error('Veuillez vous connecter pour gérer votre panier');
        return;
      }
    }
    setIsLoading(true);
    try {
      const url = userId
        ? `/api/cart-orders?bookId=${bookId}&phoneUserId=${userId}`
        : `/api/cart-orders?bookId=${bookId}&guestToken=${guestToken}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (response.ok) {
        removeItem(bookId);
        await refreshCartFromDB();
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Article supprimé du panier');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  // Vider le panier
  const handleClearCart = async () => {
    let userId = phoneUser?.id || session?.user?.id;
    let guestToken = null;
    if (!userId) {
      guestToken = localStorage.getItem('guestToken');
      if (!guestToken) {
        toast.error('Veuillez vous connecter pour gérer votre panier');
        return;
      }
    }
    if (items.length === 0 && personalizedOrders.length === 0) {
      toast.info('Votre panier est déjà vide');
      return;
    }
    setIsLoading(true);
    try {
      // Supprimer les articles standards
      for (const item of items) {
        const url = userId
          ? `/api/cart-orders?bookId=${item.bookId}&phoneUserId=${userId}`
          : `/api/cart-orders?bookId=${item.bookId}&guestToken=${guestToken}`;
        const response = await fetch(url, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Erreur lors de la suppression de l'article ${item.title}`);
        }
      }
      clear();
      // Supprimer les commandes personnalisées
      for (const order of personalizedOrders) {
        let url = `/api/orders/${order.id}`;
        if (userId) url += `?userId=${userId}`;
        else if (guestToken) url += `?guestToken=${guestToken}`;
        const response = await fetch(url, { method: 'DELETE' });
        // On ignore les erreurs individuelles pour ne pas bloquer tout le vidage
      }
      setPersonalizedOrders([]);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Panier vidé avec succès');
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      toast.error('Erreur lors du vidage du panier');
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour la quantité d'un article
  const handleUpdateQuantity = async (bookId: number, newQuantity: number) => {
    let userId = phoneUser?.id || session?.user?.id;
    let guestToken = null;
    if (!userId) {
      guestToken = localStorage.getItem('guestToken');
      if (!guestToken) {
        toast.error('Veuillez vous connecter pour gérer votre panier');
        return;
      }
    }
    if (newQuantity < 1) {
      toast.error('La quantité doit être au moins de 1');
      return;
    }
    setIsLoading(true);
    try {
      const url = userId
        ? `/api/cart-orders`
        : `/api/cart-orders?guestToken=${guestToken}`;
      const body = userId
        ? { bookId, quantity: newQuantity, phoneUserId: userId }
        : { bookId, quantity: newQuantity, guestToken };
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        updateQuantity(bookId, newQuantity);
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Quantité mise à jour');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir le panier depuis la base de données
  const refreshCartFromDB = async () => {
    let userId = phoneUser?.id || session?.user?.id;
    let guestToken = null;
    if (!userId) {
      guestToken = localStorage.getItem('guestToken');
      if (!guestToken) return;
    }
    try {
      const url = userId
        ? `/api/cart-orders?phoneUserId=${userId}`
        : `/api/cart-orders?guestToken=${guestToken}`;
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

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour finaliser votre commande');
      return;
    }
    
    // Fermer la SideCart
    toggleCart();
    
    // Rediriger vers la page panier
    router.push('/panier');
  };

  const totalStandard = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const totalPersonalized = personalizedOrders.reduce((sum, order) => sum + (order.calculatedPrice || 0), 0);
  const total = totalStandard + totalPersonalized;

  // Synchroniser le cart de la navbar lors de l'ajout d'une commande personnalisée
  useEffect(() => {
    if (isCartOpen) {
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [personalizedOrders.length]);

  // Suppression d'une commande personnalisée
  const handleRemovePersonalizedOrder = async (orderId: number) => {
    let userId = phoneUser?.id || session?.user?.id;
    let guestToken = null;
    if (!userId) {
      guestToken = localStorage.getItem('guestToken');
    }
    let url = `/api/orders/${orderId}`;
    if (userId) url += `?userId=${userId}`;
    else if (guestToken) url += `?guestToken=${guestToken}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setPersonalizedOrders((prev) => prev.filter((o) => o.id !== orderId));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Commande personnalisée supprimée');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Votre Panier</h2>
              <p className="text-orange-100 text-sm">{(items.length + personalizedOrders.length)} article(s)</p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            className="text-white hover:text-orange-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Votre panier est vide</h3>
              <p className="text-gray-500 dark:text-gray-400">Ajoutez des livres pour commencer votre collection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Commandes standards */}
              {items.map((item) => {
                const orderObj = {
                  id: item.bookId,
                  book: { coverImage: item.coverImage || '', title: item.title || '', price: item.price || 0, description: '', id: item.bookId },
                  calculatedPrice: item.calculatedPrice,
                  originalBookPrice: item.price,
                  packType: item.type === 'PERSONALIZED' ? 'Personnalisé' : undefined,
                  _type: item.type,
                  childName: '',
                  childPhotoUrl: '',
                  status: 'IN_CART',
                  readProgress: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  selectedValues: [],
                };
                return (
                  <CartItem
                    key={item.bookId + (item.type || '')}
                    order={orderObj}
                    onDelete={() => handleRemoveItem(item.bookId)}
                    isProcessingAction={isLoading}
                  />
                );
              })}
              {/* Commandes personnalisées */}
              {personalizedOrders.map((order) => (
                <PersonalizedCartItem key={order.id} order={order} onDelete={() => handleRemovePersonalizedOrder(order.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Footer avec total et bouton de commande */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-4">
              {/* Bouton vider le panier */}
              <button
                onClick={handleClearCart}
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vider le panier</span>
              </button>
              
              {/* Résumé */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sous-total (standards)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalStandard.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sous-total (personnalisés)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalPersonalized.toLocaleString()} FCFA
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                <span className="font-semibold text-green-600">Gratuite</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {total.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              
              {/* Bouton de commande */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {isAuthenticated ? 'Finaliser la commande' : 'Se connecter pour commander'}
              </button>
              
              {/* Message de sécurité */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                🔒 Paiement sécurisé • Livraison gratuite
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}