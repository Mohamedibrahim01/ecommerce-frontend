import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

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
    const url = originalRequest?.url || "";
    const normalizedUrl = url.toLowerCase();
    const isAuthEndpoint =
      normalizedUrl.includes("/auth/login") ||
      normalizedUrl.includes("/auth/refresh-token");

    if (error.response && !isAuthEndpoint) {
      const status = error.response.status;
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          const newToken = res.data?.accessToken || res.data?.token || res.data?.data?.accessToken;
          if (newToken) {
            useAuthStore.getState().login(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            throw new Error("No token returned");
          }
        } catch (refreshError) {
          useAuthStore.getState().logout();
          toast.error("Your session has expired. Please sign in again.");
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else if (status === 403) {
        toast.error("You no longer have permission to access this resource.");
      }
    }
    return Promise.reject(error);
  },
);
