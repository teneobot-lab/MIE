import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@workspace/api-client-react";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  handle: string;
  setHandle: (handle: string) => void;
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      handle: "",
      setHandle: (handle) => set({ handle }),
      addItem: (menuItem, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.menuItem.id === menuItem.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.menuItem.id === menuItem.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { menuItem, quantity }] };
        }),
      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItem.id !== menuItemId),
        })),
      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "mie-ayam-cart",
    }
  )
);
