import { useEffect, useRef, useState, useCallback } from "react";

import { getAccessToken } from "@/config/api";

interface SSEEvent {
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

async function readSseStream(
  url: string,
  token: string,
  onEvent: (event: SSEEvent) => void,
  abortSignal: AbortSignal,
): Promise<void> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: abortSignal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE connection failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data: SSEEvent = JSON.parse(line.slice(6));

          onEvent(data);
        } catch {
          // ignore parse errors
        }
      }
    }
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<SSEEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

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
    const API_URL =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      const token = getAccessToken();

      if (!token || cancelled) return;

      const controller = new AbortController();

      abortRef.current = controller;

      try {
        await readSseStream(
          `${API_URL}/notifications/stream`,
          token,
          addNotification,
          controller.signal,
        );
      } catch {
        // connection dropped or aborted
      }

      if (!cancelled) {
        abortRef.current = null;
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      cancelled = true;

      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    markAllRead,
  };
}
