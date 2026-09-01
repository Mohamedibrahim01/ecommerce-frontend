import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Endpoints that should NEVER trigger the session-expired flow
const SILENT_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh-token",
  "/auth/confirm-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Set to true during intentional logout so the interceptor stays quiet
let isIntentionalLogout = false;
export function setIntentionalLogout(value: boolean) {
  isIntentionalLogout = value;
}

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = (originalRequest?.url || "").toLowerCase();

    // Skip interceptor logic for auth/public endpoints
    const isSilentEndpoint = SILENT_ENDPOINTS.some((ep) => url.includes(ep));
    if (isSilentEndpoint) {
      return Promise.reject(error);
    }

    // Only handle HTTP errors (not network errors)
    if (!error.response) {
      return Promise.reject(error);
    }

    const status: number = error.response.status;

    // ── 401 Handling ──────────────────────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only attempt refresh if the user was actually logged in
      const hadToken = !!useAuthStore.getState().accessToken;
      if (!hadToken) {
        // Unauthenticated request to a protected route — silently reject
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken =
          res.data?.accessToken || res.data?.token || res.data?.data?.accessToken;
        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        throw new Error("No token in refresh response");
      } catch {
        // Refresh failed — genuine session expiry
        useAuthStore.getState().logout();

        // Only show toast if this is NOT an intentional logout
        if (!isIntentionalLogout) {
          toast.error("Your session has expired. Please sign in again.");
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    }

    // ── 403 Handling ──────────────────────────────────────────────────────────
    if (status === 403 && !isIntentionalLogout) {
      toast.error("You do not have permission to access this resource.");
    }

    return Promise.reject(error);
  },
);

