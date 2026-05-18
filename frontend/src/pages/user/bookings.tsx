import type { Booking } from "@/types";

import { useCallback, useEffect, useState } from "react";
import { CalendarRange, AlertCircle } from "lucide-react";

import api from "@/config/api";
import {
  BookingsSkeleton,
  BookingsEmptyState,
  BookingsList,
} from "@/components/bookings";

const sortByCreatedAt = (a: Booking, b: Booking) => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

  return bTime - aTime;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get("/bookings/my");
      const items = response.data.data?.items || response.data.data || [];

      setBookings([...items].sort(sortByCreatedAt));
      setError("");
    } catch {
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAndRefresh = () => {
      const ts = localStorage.getItem("booking_refresh_ts");

      if (ts) {
        localStorage.removeItem("booking_refresh_ts");

        return true;
      }

      return false;
    };
    fetchBookings();

    if (checkAndRefresh()) {
      fetchBookings();
    }

    const handleRefresh = () => {
      fetchBookings();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBookings();
      }
    };

    window.addEventListener("bookings:refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      if (checkAndRefresh()) {
        fetchBookings();
      }
    }, 1500);

    return () => {
      window.removeEventListener("bookings:refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [fetchBookings]);

  // Cancel booking (optimistic update status ke CANCELLED)
  const handleCancel = async (id: string) => {
    setError("");
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev
          .map((b) =>
            b.id === id ? { ...b, status: "CANCELLED" as const } : b,
          )
          .sort(sortByCreatedAt),
      );
    } catch {
      setError("Failed to cancel booking. Please try again.");
    }
  };

  const handlePayDeposit = async (id: string) => {
    try {
      await api.post(`/payments/${id}/pay`, { paymentMethod: "BANK_TRANSFER" });
      setBookings((prev) =>
        prev
          .map((b) =>
            b.id === id ? { ...b, paymentStatus: "PAID" as const } : b,
          )
          .sort(sortByCreatedAt),
      );
    } catch {
      setError("Payment failed");
    }
  };

  if (loading) {
    return <BookingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><CalendarRange size={20} /></div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Bookings</h1>
          <p className="text-default-400 text-sm font-medium">View and manage your room and facility reservations.</p>
        </div>
      </div>
      <div className="mt-2 h-0.5 w-12 rounded-full bg-primary/20 mb-6" />

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg flex items-center gap-2 text-sm font-bold mb-4" role="alert">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <BookingsEmptyState />
      ) : (
        <BookingsList
          bookings={bookings}
          onCancel={handleCancel}
          onPayDeposit={handlePayDeposit}
        />
      )}
    </div>
  );
}
