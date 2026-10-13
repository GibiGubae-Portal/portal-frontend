import axios, { AxiosError, AxiosRequestConfig } from "axios";

/**
 * By default the app talks to `/api` on its own origin: Vercel rewrites it to
 * the backend in production (vercel.json) and Vite proxies it in development.
 * Same-origin requests keep the httpOnly auth cookie first-party, so it isn't
 * blocked by browsers that reject third-party cookies (e.g. Safari).
 *
 * Set VITE_API_URL to call a backend on another origin directly instead.
 */
const resolveBaseURL = () => {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!configured) return "/api";
  const trimmed = configured.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Requests that are expected to 401 and must not trigger a global logout.
const AUTH_PROBE_URLS = ["/auth/current", "/admin/login", "/auth/logout"];

let onUnauthorized: (() => void) | null = null;

/** Registered once by the store so an expired session logs the user out. */
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    if (
      error.response?.status === 401 &&
      !AUTH_PROBE_URLS.some((probe) => url.startsWith(probe))
    ) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Turns any thrown value into a message that is safe to show to users. */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === "string" && data.message) return data.message;
    if (error.code === "ECONNABORTED") {
      return "The server took too long to respond. Please try again.";
    }
    if (!error.response) {
      return "Cannot reach the server. Check your internet connection.";
    }
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
};

export const getRequest = async <T>(url: string, config?: AxiosRequestConfig) =>
  (await api.get<T>(url, config)).data;

export const postRequest = async <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) => (await api.post<T>(url, data, config)).data;

export const putRequest = async <T, D = unknown>(
  url: string,
  data: D,
  config?: AxiosRequestConfig,
) => (await api.put<T>(url, data, config)).data;

export const deleteRequest = async <T>(url: string, config?: AxiosRequestConfig) =>
  (await api.delete<T>(url, config)).data;
