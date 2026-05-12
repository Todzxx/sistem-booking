import { useEffect, useState } from "react";
import { Card, Chip, Button } from "@heroui/react";
import { Calendar, Clock, MapPin, XCircle, AlertCircle } from "lucide-react";

import api from "@/config/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my");

        setBookings(response.data.data.bookings);
      } catch {
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)),
      );
    } catch {
      setError("Failed to cancel booking. Please try again.");
    }
  };

  const statusColor: Record<string, any> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    CANCELLED: "default",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          My Bookings
        </h1>
        <p className="text-muted font-medium mt-1">
          View and manage your room and facility reservations.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-2xl flex items-center gap-3 font-bold mb-6">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <Card className="p-12 rounded-xl border border-default-200 text-center">
          <p className="text-xl font-black text-foreground">No bookings yet</p>
          <p className="text-muted font-medium mt-2">
            Book a facility to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 rounded-2xl border border-default-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary" size={18} />
                    <p className="font-black text-lg text-foreground">
                      {booking.facility?.name || "Unknown Facility"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-default-500 font-medium">
                    <Calendar size={16} />
                    {new Date(booking.startTime).toLocaleDateString()}
                    <Clock size={16} />
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(booking.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <p className="text-sm text-default-600 font-medium">
                    {booking.purpose}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Chip
                    color={statusColor[booking.status] || "default"}
                    size="sm"
                    variant="soft"
                  >
                    {booking.status}
                  </Chip>
                  {booking.status === "PENDING" && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      onPress={() => handleCancel(booking.id)}
                    >
                      <XCircle className="text-danger" size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
