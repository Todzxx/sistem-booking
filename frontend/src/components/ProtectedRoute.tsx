// ============================================================
// FILE: components/ProtectedRoute.tsx
// Route guard — cek autentikasi & role pengguna
// adminOnly: hanya ADMIN bisa akses
// userOnly: hanya USER bisa akses (bukan ADMIN)
// ============================================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  userOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false, userOnly = false }: ProtectedRouteProps) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div aria-label="Loading" className="flex h-screen w-full items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
      </div>
    );
  }

  if (!token) return <Navigate replace to="/login" />;          // Belum login
  if (adminOnly && user?.role !== "ADMIN") return <Navigate replace to="/" />; // Bukan admin
  if (userOnly && user?.role === "ADMIN") return <Navigate replace to="/admin" />; // Admin jangan ke halaman user

  return <Outlet />;
}
