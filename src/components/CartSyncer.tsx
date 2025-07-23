'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';

export default function CartSyncer() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCartStore();
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Détecter l'utilisateur par téléphone
  const checkPhoneAuth = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const phoneAuth = localStorage.getItem('phoneAuth');
      if (phoneAuth) {
        const userData = JSON.parse(phoneAuth);
        console.log('CartSyncer - Phone user found:', userData);
        return userData;
      }
    } catch (error) {
      console.error('CartSyncer - Error parsing phoneAuth:', error);
    }
    return null;
  };

  // Charger les éléments du panier une seule fois
  const loadCartItems = async (userId?: string, guestToken?: string) => {
    if (hasLoaded) return;
    try {
      let url = '';
      if (userId) {
        url = `/api/cart-orders?phoneUserId=${userId}`;
      } else if (guestToken) {
        url = `/api/cart-orders?guestToken=${guestToken}`;
      } else {
        setItems([]);
        setHasLoaded(true);
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
      console.error('CartSyncer - Error loading cart items:', error);
    }
    setHasLoaded(true);
  };

  useEffect(() => {
    let phoneUserData = checkPhoneAuth();
    let guestToken = null;
    if (!phoneUserData && typeof window !== 'undefined') {
      guestToken = localStorage.getItem('guestToken');
    }
    if (phoneUserData) {
      setPhoneUser(phoneUserData);
      loadCartItems(phoneUserData.id, undefined);
    } else if (guestToken) {
      loadCartItems(undefined, guestToken);
    } else {
      setItems([]);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    const handlePhoneAuthUpdate = () => {
      let phoneUserData = checkPhoneAuth();
      let guestToken = null;
      if (!phoneUserData && typeof window !== 'undefined') {
        guestToken = localStorage.getItem('guestToken');
      }
      if (phoneUserData) {
        setPhoneUser(phoneUserData);
        setHasLoaded(false);
        loadCartItems(phoneUserData.id, undefined);
      } else if (guestToken) {
        setHasLoaded(false);
        loadCartItems(undefined, guestToken);
      } else {
        setItems([]);
        setHasLoaded(true);
      }
    };
    window.addEventListener('phone-auth-updated', handlePhoneAuthUpdate);
    return () => {
      window.removeEventListener('phone-auth-updated', handlePhoneAuthUpdate);
    };
  }, []);

  return null;
} 