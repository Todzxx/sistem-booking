import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Chip, Button } from "@heroui/react";
import { Bell, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";

import api from "@/config/api";
import { LOCALE } from "@/config/locale";
import { useNotifications } from "@/hooks/useNotifications";

interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface MergedNotification {
  id: string;
  type: "sse" | "db";
  title: string;
  message: string;
  status: string;
  facilityName: string;
  timestamp: string;
}

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
  const [dbNotifications, setDbNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { notifications: sseEvents, markAllRead } = useNotifications();

  const fetchNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await api.get("/notifications");
      const data: DbNotification[] = response.data.data || [];

      setDbNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching notifications", err);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    markAllRead();
  }, [fetchNotifications, markAllRead]);

  const allNotifications = useMemo(() => {
    const sseMapped = sseEvents.map((e) => ({
      id: `sse-${e.timestamp}`,
      type: "sse" as const,
      title: e.title || e.message || "",
      message: e.message || "",
      status: e.status || "",
      facilityName: e.facilityName || "",
      timestamp: e.timestamp,
    }));

    const dbMapped = dbNotifications.map((n) => ({
      id: n.id,
      type: "db" as const,
      title: n.title,
      message: n.message,
      status: n.type.replace("BOOKING_", ""), // Approximate status from type
      facilityName: "", // We don't have this in the simple notification table yet
      timestamp: n.createdAt,
    }));

    const merged = [...sseMapped, ...dbMapped];
    const seen = new Set<string>();

    return merged
      .filter((item) => {
        const key = `${item.id}`;

        if (seen.has(key)) return false;
        seen.add(key);

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [sseEvents, dbNotifications]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 rounded-xl bg-default-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-default-500 font-medium">
            Track status updates for your room bookings.
          </p>
        </div>
        <Button
          className="h-10 px-4 rounded-lg font-bold text-xs border-default-200"
          isPending={refreshing}
          variant="ghost"
          onPress={() => fetchNotifications(false)}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {allNotifications.length === 0 ? (
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
          {allNotifications.map((item: MergedNotification) => (
            <Card
              key={item.id}
              className="p-6 rounded-xl border border-default-200 bg-background/60 backdrop-blur-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-default-100 text-primary flex items-center justify-center shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-foreground">
                      {item.title || item.message}
                    </p>
                    <p className="text-sm text-default-500 font-medium">
                      {new Date(item.timestamp).toLocaleString(LOCALE)}
                    </p>
                    {item.type === "sse" && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        Real-time
                      </span>
                    )}
                  </div>
                </div>
                <Chip
                  className="font-black uppercase tracking-widest text-[10px] self-start sm:self-center"
                  color={getStatusColor(item.status)}
                  variant="soft"
                >
                  {item.status}
                </Chip>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
