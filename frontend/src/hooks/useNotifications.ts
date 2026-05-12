import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "@/config/api";

export interface SSEEvent {
  type: string;
  bookingId?: string;
  facilityName?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  title?: string;
  message?: string;
  timestamp: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<SSEEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const tokenRef = useRef<string | null>(null);

  const addNotification = useCallback((event: SSEEvent) => {
    if (event.type !== "CONNECTED") {
      setNotifications((prev) => [event, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

    const connect = () => {
      const token = getAccessToken();
      if (!token) return;

      tokenRef.current = token;
      const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          addNotification(data);
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    markAllRead,
  };
}
