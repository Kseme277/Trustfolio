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
    }),
    { name: 'cart-storage' }
  )
);