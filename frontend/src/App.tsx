// ============================================================
// FILE: App.tsx
// Root komponen React — routing, layout (sidebar + navbar), lazy loading
// Route dibagi: publik (login/register), user, userOnly (dashboard), admin
// ============================================================

import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import { Sidebar } from "@/components/sidebar";

// Lazy load halaman — hanya di-download saat route diakses
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const BookingsPage = lazy(() => import("@/pages/user/bookings"));
const CalendarPage = lazy(() => import("@/pages/user/calendar"));
const DashboardPage = lazy(() => import("@/pages/user/dashboard"));
const FacilitiesPage = lazy(() => import("@/pages/user/facilities"));
const HelpPage = lazy(() => import("@/pages/user/help"));
const NotificationsPage = lazy(() => import("@/pages/user/notifications"));
const ProfilePage = lazy(() => import("@/pages/user/profile"));

// Loading spinner saat komponen lazy sedang di-download
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-default-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Background pattern dekoratif */}
      <div
        className="pointer-events-none fixed inset-0 z-[-1] opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {!isAuthPage && <Sidebar />}
        <div className="flex w-full flex-1 flex-col">
          {!isAuthPage && <Navbar />}
          <main
            className={
              isAuthPage
                ? "flex-grow px-4 py-8 sm:px-6"
                : "container mx-auto max-w-7xl flex-grow px-6 pb-20 pt-12"
            }
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Route publik — hanya bisa diakses jika belum login */}
                <Route element={<PublicRoute />}>
                  <Route element={<LoginPage />} path="/login" />
                  <Route element={<RegisterPage />} path="/register" />
                </Route>

                {/* Route user biasa (semua role login) */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<FacilitiesPage />} path="/facilities" />
                  <Route element={<BookingsPage />} path="/bookings" />
                  <Route element={<CalendarPage />} path="/calendar" />
                  <Route
                    element={<NotificationsPage />}
                    path="/notifications"
                  />
                  <Route element={<HelpPage />} path="/help" />
                  <Route element={<ProfilePage />} path="/profile" />
                </Route>

                {/* Route khusus USER (bukan ADMIN) */}
                <Route element={<ProtectedRoute userOnly />}>
                  <Route element={<DashboardPage />} path="/" />
                </Route>

                {/* Route khusus ADMIN */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route element={<AdminDashboard />} path="/admin" />
                  <Route element={<AdminUsers />} path="/admin/users" />
                </Route>
              </Routes>
            </Suspense>
          </main>
          {!isAuthPage && (
            <footer className="flex w-full items-center justify-center border-t border-default-100 bg-background/50 py-6 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-default-400">
                  Copyright 2026 RoomSync Booking System
                </p>
                <div className="flex gap-4 text-[10px] text-default-300">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                  <span>Contact Support</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
