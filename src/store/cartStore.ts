import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product, ProductVariant, Addon } from '@types/index';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number, variant?: ProductVariant, addons?: Addon[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      total: 0,
      couponCode: undefined,

      addItem: (product, quantity = 1, variant, addons) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) =>
            item._id === product._id &&
            item.selectedVariant?.id === variant?.id
        );

        let newItems: CartItem[];
        
        if (existingItemIndex > -1) {
          newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          const newItem: CartItem = {
            ...product,
            quantity,
            selectedVariant: variant,
            addons: addons || [],
          };
          newItems = [...items, newItem];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (productId) => {
        const items = get().items.filter((item) => item._id !== productId);
        set({ items });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        );
        set({ items });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          discount: 0,
          total: 0,
          couponCode: undefined,
        });
      },

      applyCoupon: (code, discount) => {
        set({ couponCode: code, discount });
        get().calculateTotals();
      },

      removeCoupon: () => {
        set({ couponCode: undefined, discount: 0 });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const { items, discount } = get();
        
        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
          const itemPrice = item.selectedVariant?.price || item.price;
          const addonsPrice = item.addons?.reduce((acc, addon) => acc + addon.price, 0) || 0;
          return sum + (itemPrice + addonsPrice) * item.quantity;
        }, 0);

        // Calculate delivery fee (example: free delivery above 100 EGP)
        const deliveryFee = subtotal > 100 ? 0 : 15;

        // Calculate tax (example: 14% VAT)
        const tax = subtotal * 0.14;

        // Calculate total
        const total = subtotal + deliveryFee + tax - discount;

        set({
          subtotal,
          deliveryFee,
          tax,
          total: Math.max(0, total),
        });
      },
    }),
    {
      name: 'alma-cart-storage',
    }
  )
);
