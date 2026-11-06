
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Attach access token to requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Handle expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthRequest = String(original?.url || "").includes(
      "/auth/"
    );

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Share one refresh request across concurrent API failures
    if (!refreshPromise) {
      refreshPromise = api
        .post("/auth/refresh", {})
        .then((response) => {
          const token = response.data.accessToken;
          setAccessToken(token);
          return token;
        })
        .catch(() => {
          setAccessToken(null);
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const token = await refreshPromise;

    if (token) {
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${token}`;

      return api(original);
    }

    setAccessToken(null);

    return Promise.reject(error);
  }
);
