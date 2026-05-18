import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";

import { User, Booking, Facility } from "@/types";
import api from "@/config/api";
import {
  DashboardHeader,
  StatsGrid,
  QuickAccess,
  ActivityInsights,
} from "@/components/dashboard";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalFacilities: 0,
    myBookings: 0,
    upcoming: 0,
  });

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

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    window.addEventListener("bookings:refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      const ts = localStorage.getItem("booking_refresh_ts");

      if (ts) {
        localStorage.removeItem("booking_refresh_ts");
        fetchData();
      }
    }, 1500);

    return () => {
      window.removeEventListener("bookings:refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
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
      <DashboardHeader userName={user?.name?.split(" ")[0] || "User"} />

      <StatsGrid
        myBookings={stats.myBookings}
        totalFacilities={stats.totalFacilities}
        upcoming={stats.upcoming}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <ActivityInsights />
        <QuickAccess />
      </div>
    </div>
  );
}
