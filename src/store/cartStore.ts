import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';

export type CartItem = {
  bookId: number;
  quantity: number;
  type?: 'STANDARD' | 'PERSONALIZED';
  personalizedOrderId?: number;
  calculatedPrice?: number;
  // Informations du livre pour l'affichage
  title?: string;
  price?: number;
  coverImage?: string;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: CartItem) => void;
  addPersonalizedOrder: (orderId: number, calculatedPrice: number) => void;
  clear: () => void;
  setItems: (items: CartItem[]) => void;
  toggleCart: () => void;
  removeItem: (bookId: number, type?: string) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  syncWithAPI: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(i => i.bookId === item.bookId && i.type === item.type);
        if (existing) {
          existing.quantity += item.quantity;
          set({ items: [...items] });
        } else {
          set({ items: [...items, item] });
        }
        toast.success('Article ajouté au panier !');
      },
      addPersonalizedOrder: (orderId: number, calculatedPrice: number) => {
        const items = get().items;
        const personalizedItem: CartItem = {
          bookId: 0, // Sera mis à jour quand on récupère l'order
          quantity: 1,
          type: 'PERSONALIZED',
          personalizedOrderId: orderId,
          calculatedPrice
        };
        set({ items: [...items, personalizedItem] });
        toast.success('Article ajouté au panier !');
      },
      clear: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      removeItem: (bookId: number, type?: string) => {
        const items = get().items;
        const filtered = items.filter(item => 
          !(item.bookId === bookId && (!type || item.type === type))
        );
        set({ items: filtered });
      },
      updateQuantity: (bookId: number, quantity: number) => {
        const items = get().items;
        const updated = items.map(item => 
          item.bookId === bookId ? { ...item, quantity } : item
        );
        set({ items: updated });
      },
      syncWithAPI: async () => {
        try {
          let userId = null;
          let guestToken = null;
          if (typeof window !== 'undefined') {
            const phoneAuth = localStorage.getItem('phoneAuth');
            if (phoneAuth) {
              try {
                const userData = JSON.parse(phoneAuth);
                userId = userData?.id;
              } catch {}
            }
            if (!userId) {
              guestToken = localStorage.getItem('guestToken');
            }
          }
          
          let url = '/api/cart-orders?status=IN_CART';
          if (userId) url += `&userId=${userId}`;
          else if (guestToken) url += `&guestToken=${guestToken}`;
          else {
            set({ items: [] });
            return;
          }
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const cartItems = data.map((order: any) => ({
                bookId: order.bookId,
                title: order.book.title,
                price: order.book.price,
                coverImage: order.book.coverImage,
                quantity: order.quantity,
                type: 'STANDARD' as const
              }));
              set({ items: cartItems });
            }
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation du store:', error);
        }
      },
    }),
    { name: 'cart-storage' }
  )
);