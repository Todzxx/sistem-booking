// ============================================================
// FILE: pages/user/bookings.tsx
// Halaman booking milik user — lihat daftar, cancel, bayar deposit
// Setiap booking punya status chip + aksi sesuai status
// ============================================================

import type { Booking, BookingStatus } from "@/types";
import { useEffect, useState } from "react";
import { Card, Chip, Button } from "@heroui/react";
import { Calendar, Clock, MapPin, XCircle, AlertCircle, CalendarRange } from "lucide-react";
import { AxiosError } from "axios";
import api from "@/config/api";

// Style per status booking — chip color + border kiri
const STATUS_STYLES: Record<BookingStatus, { color: "warning" | "success" | "danger" | "default"; label: string; border: string }> = {
  PENDING: { color: "warning", label: "Pending", border: "border-l-warning" },
  APPROVED: { color: "success", label: "Approved", border: "border-l-success" },
  REJECTED: { color: "danger", label: "Rejected", border: "border-l-danger" },
  CANCELLED: { color: "default", label: "Cancelled", border: "border-l-default-300" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my");
        setBookings(response.data.data?.items || response.data.data || []);
      } catch { setError("Failed to load bookings. Please try again."); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  // Cancel booking (optimistic update status ke CANCELLED)
  const handleCancel = async (id: string) => {
    setError("");
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" as const } : b));
    } catch { setError("Failed to cancel booking. Please try again."); }
  };

  const getStyle = (status: string) => STATUS_STYLES[status as BookingStatus] || STATUS_STYLES.CANCELLED;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="h-8 w-44 bg-default-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-default-100 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-default-50 animate-pulse border border-default-100" />)}
        </div>
      </div>
    );
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
        <Card className="py-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-default-200 rounded-xl" role="status">
          <div className="w-14 h-14 rounded-xl bg-default-100 flex items-center justify-center mb-4"><CalendarRange className="text-default-300" size={28} /></div>
          <p className="text-default-500 text-lg font-black">No bookings yet</p>
          <p className="text-default-400 text-sm font-medium mt-1">Browse facilities and book a space to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {bookings.map((booking) => {
            const style = getStyle(booking.status);
            return (
              <Card key={booking.id} className={`relative overflow-hidden rounded-xl border border-default-200 border-l-4 ${style.border} transition-all hover:border-default-300`}>
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="text-primary shrink-0" size={16} />
                      <p className="font-black text-base text-foreground truncate">{booking.facility?.name || "Unknown Facility"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-default-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {booking.startTime ? new Date(booking.startTime).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        {" — "}
                        {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                    {booking.purpose && <p className="text-sm text-default-500 font-medium leading-snug line-clamp-1">{booking.purpose}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Chip className="font-bold text-[11px] px-2.5 h-6" color={style.color} size="sm" variant="soft">{style.label}</Chip>
                    {booking.status === "PENDING" && (
                      <Button isIconOnly aria-label="Cancel booking" className="text-danger/60 hover:text-danger hover:bg-danger/5 rounded-lg h-8 w-8 min-w-0" size="sm" variant="ghost" onPress={() => handleCancel(booking.id)}>
                        <XCircle size={16} />
                      </Button>
                    )}
                    {booking.status === "APPROVED" && booking.paymentStatus === "UNPAID" && booking.depositAmount && parseFloat(booking.depositAmount) > 0 && (
                      <Button className="font-bold text-[10px] h-7 px-3 rounded-lg" size="sm" variant="primary"
                        onPress={async () => {
                          try {
                            await api.post(`/payments/${booking.id}/pay`, { paymentMethod: "BANK_TRANSFER" });
                            setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, paymentStatus: "PAID" } : b));
                          } catch (err) {
                            setError(err instanceof AxiosError ? err.response?.data?.message || "Payment failed" : "Payment failed");
                          }
                        }}
                      >Pay Deposit</Button>
                    )}
                    {booking.paymentStatus === "PAID" && (
                      <Chip className="font-bold text-[9px] h-5 px-1.5" color="success" size="sm" variant="soft">PAID</Chip>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
