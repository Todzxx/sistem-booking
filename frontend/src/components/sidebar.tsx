// ============================================================
// FILE: components/sidebar.tsx
// Sidebar navigasi — tampil di layar lg+, hidden di mobile
// Berisi logo, menu navigasi (dengan badge notifikasi), theme switcher, user info, logout
// ============================================================

import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  History,
  UserCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Bell,
  CircleHelp,
} from "lucide-react";

import { ThemeSwitcher } from "./theme-switcher";

import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const isActive = (path: string) => location.pathname === path;

  if (!token) return null;

  // Menu items berbeda untuk USER vs ADMIN
  const userMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Facilities", icon: Building2, path: "/facilities" },
    { label: "Schedule", icon: CalendarDays, path: "/calendar" },
    { label: "My Bookings", icon: History, path: "/bookings" },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: unreadCount,
    },
    { label: "Help/Support", icon: CircleHelp, path: "/help" },
    { label: "Profile", icon: UserCircle, path: "/profile" },
  ];
  const adminMenuItems = [
    { label: "Facilities", icon: Building2, path: "/facilities" },
    { label: "Schedule", icon: CalendarDays, path: "/calendar" },
    { label: "Admin Panel", icon: ShieldCheck, path: "/admin" },
    { label: "Users", icon: UserCircle, path: "/admin/users" },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: unreadCount,
    },
    { label: "Profile", icon: UserCircle, path: "/profile" },
  ];
  const menuItems = user?.role === "ADMIN" ? adminMenuItems : userMenuItems;

  return (
    <nav
      aria-label="Main navigation"
      className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-default-200 bg-default-50/80 backdrop-blur-xl p-6 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="p-2.5 bg-accent text-accent-foreground rounded-xl shadow-lg shadow-accent/30 flex items-center justify-center">
          <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
          </svg>
        </div>
        <span className="font-black text-2xl tracking-tighter text-default-900 dark:text-white">
          ROOMSYNC
        </span>
      </div>

      {/* Menu navigasi (scrollable) */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0 pr-1">
        <h2 className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] px-4 mb-2">
          Main Menu
        </h2>
        {menuItems.map((item) => {
          const isItemActive = isActive(item.path);

          return (
            <Link
              key={item.path}
              className={`group flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 ${isItemActive ? "bg-primary/10 text-primary shadow-sm scale-[1.02]" : "text-default-500 hover:bg-default-100 hover:text-foreground"}`}
              to={item.path}
            >
              <div className="flex items-center gap-4">
                <item.icon
                  className={
                    isItemActive
                      ? "text-primary"
                      : "group-hover:text-primary transition-colors"
                  }
                  size={20}
                />
                <span
                  className={`font-bold text-sm ${isItemActive ? "text-primary" : ""}`}
                >
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && item.badge !== undefined && (
                  <span
                    aria-label={`${unreadCount} unread notifications`}
                    className="bg-danger text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {isItemActive && (
                  <ChevronRight className="text-primary/70" size={16} />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bagian bawah — theme switcher, user info, logout */}
      <div className="mt-4 flex flex-col gap-4 shrink-0">
        <div className="p-2 bg-default-50 rounded-xl border border-default-100 flex items-center justify-between">
          <span className="text-xs font-black text-default-400 px-2 uppercase tracking-widest">
            Theme
          </span>
          <ThemeSwitcher />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-background/60 dark:bg-default-50/50 border border-default-200 rounded-xl shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-black text-foreground truncate">
                {user?.name}
              </span>
              <Chip
                className="h-4 text-[8px] font-black uppercase tracking-tighter"
                color="accent"
                size="sm"
                variant="soft"
              >
                {user?.role}
              </Chip>
            </div>
          </div>
          <Button
            className="w-full h-11 rounded-xl font-black text-xs border-default-200 text-danger hover:bg-danger/10 hover:border-danger/20 transition-all"
            variant="ghost"
            onPress={handleLogout}
          >
            <LogOut className="mr-2" size={16} /> LOGOUT
          </Button>
        </div>
      </div>
    </nav>
  );
};
