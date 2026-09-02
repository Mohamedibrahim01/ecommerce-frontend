import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/src/lib/api";
import { useAuthStore } from "./authStore";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  countInStock: number;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  syncLocalCart: () => Promise<void>;
}

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
  items: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    try {
      set({ isLoading: true });
      const response = await api.get("/carts");
      const data = response.data?.data || response.data;
      set({ 
        items: data?.cartItems || [], 
        totalPrice: data?.totalPrice || 0,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      set({ items: [], totalPrice: 0, isLoading: false });
    }
  },

  addItem: async (productId: string, quantity: number = 1) => {
    try {
      set({ isLoading: true });
      if (useAuthStore.getState().isAuthenticated) {
        await api.post("/carts", { productId, quantity });
        await get().fetchCart();
      } else {
        // Unauthenticated local handling
        const { items } = get();
        const existingItem = items.find((i) => i.product._id === productId);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > existingItem.product.countInStock) {
             set({ isLoading: false });
             throw new Error(`Only ${existingItem.product.countInStock} items left in stock.`);
          }
          const updatedItems = items.map((i) =>
            i.product._id === productId ? { ...i, quantity: newQuantity } : i
          );
          set({ items: updatedItems, totalPrice: calculateTotal(updatedItems), isLoading: false });
        } else {
          // Fetch product info to store locally
          const response = await api.get(`/products/${productId}`);
          const prodData = response.data?.data || response.data;
          
          if (quantity > prodData.countInStock) {
             set({ isLoading: false });
             throw new Error(`Only ${prodData.countInStock} items left in stock.`);
          }

          const newItem: CartItem = {
            _id: productId,
            product: {
              _id: prodData._id,
              name: prodData.name,
              price: prodData.price,
              image: prodData.image,
              countInStock: prodData.countInStock,
            },
            quantity,
            price: prodData.price,
          };
          const updatedItems = [...items, newItem];
          set({ items: updatedItems, totalPrice: calculateTotal(updatedItems), isLoading: false });
        }
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeItem: async (productId: string) => {
    try {
      set({ isLoading: true });
      if (useAuthStore.getState().isAuthenticated) {
        await api.delete(`/carts/${productId}`);
        await get().fetchCart();
      } else {
        const { items } = get();
        const updatedItems = items.filter((i) => i.product._id !== productId);
        set({ items: updatedItems, totalPrice: calculateTotal(updatedItems), isLoading: false });
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      set({ isLoading: true });
      if (useAuthStore.getState().isAuthenticated) {
        await api.put("/carts", { productId, quantity });
        await get().fetchCart();
      } else {
        const { items } = get();
        const updatedItems = items.map((i) =>
          i.product._id === productId ? { ...i, quantity } : i
        );
        set({ items: updatedItems, totalPrice: calculateTotal(updatedItems), isLoading: false });
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true });
      if (useAuthStore.getState().isAuthenticated) {
        await api.delete("/carts");
      }
      set({ items: [], totalPrice: 0, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  syncLocalCart: async () => {
    const { items } = get();
    if (!useAuthStore.getState().isAuthenticated || items.length === 0) return;
    
    try {
      set({ isLoading: true });
      // Add each item to the backend cart
      for (const item of items) {
        try {
          await api.post("/carts", { productId: item.product._id, quantity: item.quantity });
        } catch (err) {
          console.error(`Failed to sync item ${item.product.name}:`, err);
        }
      }
      // After syncing, clear local representation and fetch the canonical cart from backend
      set({ items: [], totalPrice: 0 });
      await get().fetchCart();
    } catch (error) {
      console.error("Cart sync failed:", error);
      set({ isLoading: false });
    }
  },
    }),
    {
      name: "ecommerce-cart",
      partialize: (state) => ({ items: state.items, totalPrice: state.totalPrice }),
    }
  )
);
