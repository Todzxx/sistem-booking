import { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  LayoutGrid,
  Calendar,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { User, Booking, Facility } from "@/types";
import api from "@/config/api";

const STAT_COLORS: Record<string, { bg: string; text: string; icon: string }> =
  {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: "text-primary",
    },
    secondary: {
      bg: "bg-secondary/10",
      text: "text-secondary",
      icon: "text-secondary",
    },
    success: {
      bg: "bg-success/10",
      text: "text-success",
      icon: "text-success",
    },
  };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalFacilities: 0,
    myBookings: 0,
    upcoming: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileRes, facilitiesRes, bookingsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/facilities"),
          api.get("/bookings/my"),
        ]);

        setUser(profileRes.data.data);

        const facilities: Facility[] =
          facilitiesRes.data.data?.items || facilitiesRes.data.data || [];
        const bookings: Booking[] =
          bookingsRes.data.data?.items || bookingsRes.data.data || [];

        setStats({
          totalFacilities: Array.isArray(facilities) ? facilities.length : 0,
          myBookings: Array.isArray(bookings) ? bookings.length : 0,
          upcoming: Array.isArray(bookings)
            ? bookings.filter((b) => new Date(b.startTime) > new Date()).length
            : 0,
        });
      } catch {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        aria-label="Loading dashboard"
        className="max-w-6xl mx-auto py-8 px-4 animate-fade-in"
        role="status"
      >
        <div className="h-48 bg-default-100 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-default-50 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-default-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3 font-bold"
          role="alert"
        >
          <AlertCircle size={18} />
          {error}
        </div>
        <Button
          className="font-black rounded-xl"
          variant="ghost"
          onPress={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-8 px-4">
      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-xl bg-primary p-6 md:p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
          <Sparkles size={240} />
        </div>
        <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur-md text-xs font-black uppercase tracking-widest border border-primary-foreground/20">
            <Zap className="fill-current" size={14} />
            System Online
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Welcome Back, <br />
              <span className="opacity-80">
                {user?.name?.split(" ")[0] || "User"}!
              </span>
            </h1>
            <p className="text-lg md:text-xl font-medium opacity-70 max-w-md">
              Everything you need to manage your workspace and team schedule in
              one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="h-14 px-8 rounded-xl bg-primary-foreground text-primary font-black text-base transition-transform active:scale-[0.97]"
              onPress={() => navigate("/facilities")}
            >
              Start Booking
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Available Spaces",
            value: stats.totalFacilities,
            icon: LayoutGrid,
            color: "primary" as const,
          },
          {
            label: "Total Bookings",
            value: stats.myBookings,
            icon: ClipboardList,
            color: "secondary" as const,
          },
          {
            label: "Upcoming Events",
            value: stats.upcoming,
            icon: Calendar,
            color: "success" as const,
          },
        ].map((stat, i) => {
          const colors = STAT_COLORS[stat.color];

          return (
            <Card
              key={i}
              className="p-6 border border-default-200 bg-background/60 backdrop-blur-md transition-all group overflow-hidden hover:border-default-300"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className={colors.text} size={100} />
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${colors.bg} ${colors.icon}`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-black text-default-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <TrendingUp className="text-primary" />
              Activity Insights
            </h3>
          </div>

          <Card className="p-6 border border-default-200 bg-background/60 backdrop-blur-md rounded-xl">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-20 h-20 bg-default-100 rounded-xl flex items-center justify-center mb-6 text-default-300">
                <Clock size={40} />
              </div>
              <p className="text-xl font-black text-foreground">
                No Recent Activity
              </p>
              <p className="text-default-500 font-medium mt-2 max-w-xs">
                Your recent booking history and system notifications will appear
                here once you start using the platform.
              </p>
              <Button
                className="mt-8 rounded-xl font-bold border-default-200"
                variant="ghost"
                onPress={() => navigate("/calendar")}
              >
                View Schedule
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar/Quick Actions */}
        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-black tracking-tight px-2">
            Quick Access
          </h3>

          <div className="flex flex-col gap-4">
            <Button
              className="group p-6 rounded-xl bg-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-all text-left flex items-center justify-between h-auto"
              variant="ghost"
              onPress={() => navigate("/profile")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <UserIcon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">
                    Account Settings
                  </span>
                  <span className="text-xs font-medium text-default-400">
                    Update your preferences
                  </span>
                </div>
              </div>
              <ChevronRight
                className="text-secondary/40 group-hover:translate-x-1 transition-transform"
                size={18}
              />
            </Button>

            <Button
              className="group p-6 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center justify-between h-auto"
              variant="ghost"
              onPress={() => navigate("/calendar")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">
                    Room Calendar
                  </span>
                  <span className="text-xs font-medium text-default-400">
                    Browse availability
                  </span>
                </div>
              </div>
              <ChevronRight
                className="text-primary/40 group-hover:translate-x-1 transition-transform"
                size={18}
              />
            </Button>

            <Button
              className="group p-6 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center justify-between h-auto"
              variant="ghost"
              onPress={() => navigate("/calendar")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">
                    Availability
                  </span>
                  <span className="text-xs font-medium text-default-400">
                    See what&apos;s free today
                  </span>
                </div>
              </div>
              <ChevronRight
                className="text-primary/40 group-hover:translate-x-1 transition-transform"
                size={18}
              />
            </Button>
          </div>

          <Card className="p-6 bg-default-50 border border-default-200 rounded-xl">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-black text-default-400 uppercase tracking-[0.2em]">
                Need Help?
              </p>
              <p className="text-sm font-medium text-default-600">
                Having trouble with a booking? Our support team is here to help
                you 24/7.
              </p>
              <Button className="mt-2 font-black rounded-xl" variant="ghost">
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
