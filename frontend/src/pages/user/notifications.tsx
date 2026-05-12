import { useEffect, useMemo, useState } from "react";
import { Card, Chip } from "@heroui/react";
import { Bell, CheckCircle2, Clock, XCircle } from "lucide-react";

import api from "@/config/api";
import { LOCALE } from "@/config/locale";

function getStatusIcon(status: string) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 size={18} />;
    case "PENDING":
      return <Clock size={18} />;
    default:
      return <XCircle size={18} />;
  }
}

function getStatusMessage(booking: any) {
  const room = booking.facility?.name || "selected room";

  switch (booking.status) {
    case "APPROVED":
      return `Your booking for ${room} has been approved.`;
    case "REJECTED":
      return `Your booking for ${room} was rejected.`;
    case "CANCELLED":
      return `Your booking for ${room} has been cancelled.`;
    default:
      return `Your booking for ${room} is waiting for admin approval.`;
  }
}

function getStatusColor(
  status: string,
): "default" | "danger" | "success" | "warning" | "accent" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export default function NotificationsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.get("/bookings/my");
        const data = response.data.data?.bookings || response.data.data || [];

        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const notifications = useMemo(
    () =>
      [...bookings].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      ),
    [bookings],
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Notifications
        </h1>
        <p className="text-muted font-medium text-lg">
          Track status updates for your room bookings.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 rounded-xl bg-default-100 animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center bg-default-50/30 border-dashed border-2 border-default-200 rounded-[2.5rem]">
          <div className="w-20 h-20 bg-default-100 rounded-xl flex items-center justify-center mb-6">
            <Bell className="text-default-300" size={40} />
          </div>
          <p className="text-default-400 text-xl font-black">
            No notifications yet.
          </p>
          <p className="text-default-400 mt-1 font-medium">
            Booking status messages will appear here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 rounded-xl border border-default-200 bg-background/60 backdrop-blur-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-default-100 text-primary flex items-center justify-center shrink-0">
                    {getStatusIcon(booking.status)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-foreground">
                      {getStatusMessage(booking)}
                    </p>
                    <p className="text-sm text-default-500 font-medium">
                      {new Date(
                        booking.updatedAt || booking.createdAt,
                      ).toLocaleString(LOCALE)}
                    </p>
                  </div>
                </div>
                <Chip
                  className="font-black uppercase tracking-widest text-[10px] self-start sm:self-center"
                  color={getStatusColor(booking.status)}
                  variant="soft"
                >
                  {booking.status}
                </Chip>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
