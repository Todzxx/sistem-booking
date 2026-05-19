// ============================================================
// FILE: components/PublicRoute.tsx
// Route untuk halaman publik (login/register)
// Jika user sudah login, redirect ke dashboard masing-masing
// ============================================================

import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function PublicRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div
        aria-label="Loading"
        className="flex h-screen w-full items-center justify-center"
        role="status"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-primary" />
      </div>
    );
  }

  // Jika sudah login, redirect ke dashboard
  if (token)
    return <Navigate replace to={user?.role === "ADMIN" ? "/admin" : "/"} />;

  return <Outlet />;
}
