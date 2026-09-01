import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// In-memory token storage to avoid XSS risks associated with localStorage
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Use env variable if available, otherwise fallback to local proxy or same domain
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token if present
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Queue for holding requests while token is refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401s and token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Extract backend error message gracefully
    const responseData = error.response?.data as any;
    const errorMessage = responseData?.message || error.message;
    const errorCode = responseData?.code;

    // Check if error is 401 and specific to expired token
    if (
      error.response?.status === 401 &&
      errorCode === 'TOKEN_EXPIRED' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If refresh is already in flight, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct call to avoid loop, using the original base URL
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Update in-memory token
        const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        setAccessToken(newAccessToken);

        // Process all queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setAccessToken(null);

        // Redirect to login or handle logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          ...(refreshError as any),
          message: 'Session expired. Please log in again.',
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Return custom rejected promise for unified UI error handling
    return Promise.reject({ ...error, message: errorMessage, code: errorCode });
  }
);
