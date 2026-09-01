import { create } from "zustand";
import { api } from "@/src/lib/api";

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
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
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
      await api.post("/carts/add", { productId, quantity });
      await get().fetchCart();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeItem: async (productId: string) => {
    try {
      set({ isLoading: true });
      await api.delete(`/carts/remove/${productId}`);
      await get().fetchCart();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      set({ isLoading: true });
      await api.put("/carts/update-quantity", { productId, quantity });
      await get().fetchCart();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true });
      await api.delete("/carts/clear");
      set({ items: [], totalPrice: 0, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
