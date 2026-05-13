import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function resetSession() {
  setAccessToken(null);
  window.location.href = "/login";
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

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

        if (data && data.data && data.data.token) {
          setAccessToken(data.data.token);
          error.config.headers.Authorization = `Bearer ${data.data.token}`;

          return axios(error.config);
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
