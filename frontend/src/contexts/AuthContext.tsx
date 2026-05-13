// ============================================================
// FILE: contexts/AuthContext.tsx
// Context autentikasi — manage user state, token, login/logout
// Pada mount, coba refresh token via /auth/refresh
// Gunakan pendingRefresh singleton untuk cegah double-request StrictMode
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "@/config/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (token: string, _refreshToken: string, userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Singleton promise — StrictMode React 19 memanggil effect 2x,
// shared promise ini mencegah HTTP request duplikat ke /auth/refresh
let pendingRefresh: Promise<any> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false; // flag untuk cleanup jika komponen unmount

    // Coba refresh token session — jika cookie masih valid, server return token baru
    if (!pendingRefresh) {
      pendingRefresh = api.post("/auth/refresh").finally(() => { pendingRefresh = null; });
    }

    pendingRefresh
      .then((res) => {
        if (cancelled) return;
        if (res.data?.data?.token) {
          setAccessToken(res.data.data.token);
          setToken(res.data.data.token);
          return api.get("/auth/me"); // ambil profil user
        }
        throw new Error("No token");
      })
      .then((res) => {
        if (cancelled || !res) return;
        setUser(res.data.data);
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null); setUser(null); setAccessToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const login = (newToken: string, _newRefreshToken: string, userData: User) => {
    setAccessToken(newToken); setToken(newToken); setUser(userData);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ } finally {
      setAccessToken(null); setToken(null); setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
