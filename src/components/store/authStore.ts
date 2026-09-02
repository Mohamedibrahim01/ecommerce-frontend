import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAccessToken as setApiAccessToken } from "@/src/lib/api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  isAdmin?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: AuthUser, token: string) => void;
  register: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  checkRefresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        setApiAccessToken(token);
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      },
      
      register: (user, token) => {
        setApiAccessToken(token);
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          setApiAccessToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
          // Clear local cart state on logout
          import("./cartStore").then(({ useCartStore }) => {
            useCartStore.setState({ items: [], totalPrice: 0 });
          }).catch(console.error);
        }
      },

      setToken: (token) => {
        setApiAccessToken(token);
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      isAdmin: () => {
        const state = get();
        return state.user?.isAdmin === true;
      },

      checkRefresh: async () => {
        const state = get();
        if (state.isAuthenticated && !state.accessToken) {
          set({ isLoading: true });
          try {
            const res = await api.post("/auth/refresh-token");
            const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
            setApiAccessToken(newAccessToken);
            set({ accessToken: newAccessToken, isLoading: false });
          } catch (error) {
            setApiAccessToken(null);
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
          }
        }
      },
    }),
    {
      name: "ecommerce-auth",
      // Only persist user data and auth flag, NOT the access token for security reasons.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
