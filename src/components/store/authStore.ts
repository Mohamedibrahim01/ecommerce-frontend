import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../auth/axiosInstance";


export const ROLES = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  MODERATOR: "Moderator",
  SUPPORT: "Support",
  CONTENT_MANAGER: "Content Manager",
} as const;

// Helper to extract role claims from JWT when API response roles are omitted
function extractRolesFromToken(token: string | null): string[] {
  if (!token) return [];
  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    const roleClaim =
      payload.roles ||
      payload.role ||
      payload.Role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!roleClaim) return [];
    if (Array.isArray(roleClaim)) return roleClaim.map(String);
    if (typeof roleClaim === "string") return [roleClaim];
    return [];
  } catch {
    return [];
  }
}

// types
export interface AuthUser {
  _id?: string | number;
  id?: string | number; // keeping for backwards compatibility if needed
  name?: string;
  email?: string;
  avatar?: string | null;
  isAdmin?: boolean;
  isEmailConfirmed?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  roles: string[];
  isLoading: boolean;

  login: (token: string, roles?: string[], user?: AuthUser | null) => void;
  logout: () => Promise<void>;
  checkRefresh: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

// store creation
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      roles: [],
      isLoading: true,

      login: (token, roles, user = null) => {
        // Primary source: response.data.roles. Fallback: extract from JWT
        const finalRoles =
          roles && Array.isArray(roles) && roles.length > 0
            ? roles
            : extractRolesFromToken(token);
        set({ accessToken: token, roles: finalRoles, user, isLoading: false });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          set({ accessToken: null, user: null, roles: [] });
        }
      },
      checkRefresh: async () => {
        try {
          const response = await api.post(
            "/auth/refresh-token",
            {},
            { withCredentials: true },
          );
          const token = response.data?.token || response.data?.accessToken || null;
          const roles = response.data?.roles;
          const user = response.data?.user || response.data?.data?.user || null;
          const finalRoles =
            roles && Array.isArray(roles) && roles.length > 0
              ? roles
              : extractRolesFromToken(token);
          set({ accessToken: token, roles: finalRoles, user, isLoading: false });
        } catch {
          set({ accessToken: null, user: null, roles: [], isLoading: false });
        }
      },

      isAdmin: () => {
        const state = get();
        return state.roles.some(
          (r) =>
            r.toLowerCase() === ROLES.ADMIN.toLowerCase() ||
            r.toLowerCase() === "administrator"
        );
      },

      hasRole: (role: string) => {
        const state = get();
        return state.roles.some((r) => r.toLowerCase() === role.toLowerCase());
      },
    }),
    {
      name: "sh-supplements-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        roles: state.roles,
      }),
    },
  ),
);

export const isAdmin = () => useAuthStore.getState().isAdmin();
export const hasRole = (role: string) => useAuthStore.getState().hasRole(role);
