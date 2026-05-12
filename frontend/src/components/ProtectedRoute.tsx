import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  userOnly?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
  userOnly = false,
}: ProtectedRouteProps) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
      </div>
    );
  }

  if (!token) {
    return <Navigate replace to="/login" />;
  }

  if (adminOnly && user?.role !== "ADMIN") {
    return <Navigate replace to="/" />;
  }

  if (userOnly && user?.role === "ADMIN") {
    return <Navigate replace to="/admin" />;
  }

  return <Outlet />;
}
