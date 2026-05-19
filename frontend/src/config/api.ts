// ============================================================
// FILE: config/api.ts
// Konfigurasi Axios — base URL, interceptor request (tambah Bearer token),
// interceptor response (auto-refresh token saat 401)
// ============================================================

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Access token disimpan di variable (bukan localStorage) — lebih aman dari XSS
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}

// Redirect ke login jika refresh gagal
function resetSession() {
  setAccessToken(null);
  window.location.href = "/login";
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Kirim cookie (refreshToken) otomatis
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor request — tambahkan Bearer token ke setiap request
api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor response — jika 401, coba refresh token otomatis
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.config.url !== "/auth/refresh"
    ) {
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (data?.data?.token) {
          setAccessToken(data.data.token);
          error.config.headers.Authorization = `Bearer ${data.data.token}`;

          return axios(error.config); // ulangi request yang gagal
        }
        resetSession();
      } catch {
        resetSession();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
