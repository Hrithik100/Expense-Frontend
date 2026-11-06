
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

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !String(original.url).includes("/auth/")
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh", {})
          .then((response) => {
            accessToken = response.data.accessToken;
            return accessToken;
          })
          .catch(() => {
            accessToken = null;
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const token = await refreshPromise;

      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);
