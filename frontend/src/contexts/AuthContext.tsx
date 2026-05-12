import React, { createContext, useContext, useEffect, useState } from "react";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((res) => {
        if (res.data?.data?.token) {
          setAccessToken(res.data.data.token);
          setToken(res.data.data.token);

          return api.get("/auth/me");
        }
        throw new Error("No token");
      })
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (
    newToken: string,
    _newRefreshToken: string,
    userData: User,
  ) => {
    setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      setAccessToken(null);
      setToken(null);
      setUser(null);
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

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
