import type { Booking, Facility } from "@/types";

import { useEffect, useMemo, useState } from "react";

import api from "@/config/api";
import { LOCALE } from "@/config/locale";
import { extractCollection } from "@/utils/apiData";
import { FACILITY_COLORS, getFacilityColor } from "@/components/calendar";

export function useCalendarData() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await api.get("/facilities");
        const data = extractCollection<Facility>(response.data.data, [
          "facilities",
        ]);

        setFacilities(data);
        if (data.length > 0) setSelectedFacility(data[0].id);
      } catch {
        setFetchError("Failed to load facilities. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!selectedFacility) return;

    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const fetchFacilityBookings = async () => {
      if (cancelled) return;
      setBookingsLoading(true);
      try {
        const response = await api.get(
          `/bookings/facility/${selectedFacility}`,
        );
        const data = extractCollection<Booking>(response.data.data);

        if (cancelled) return;
        setBookings(data);
        setFetchError("");
      } catch {
        if (cancelled) return;
        setFetchError("Failed to load schedule. Please try again.");
        setBookings([]);
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    };

    const checkAndRefresh = () => {
      const ts = localStorage.getItem("booking_refresh_ts");

      if (ts) {
        localStorage.removeItem("booking_refresh_ts");

        return true;
      }

      return false;
    };

    const handleRefresh = () => {
      fetchFacilityBookings();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchFacilityBookings();
      }
    };

    window.addEventListener("bookings:refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    interval = setInterval(() => {
      if (checkAndRefresh()) {
        fetchFacilityBookings();
      }
    }, 1500);

    fetchFacilityBookings();

    return () => {
      cancelled = true;
      window.removeEventListener("bookings:refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [selectedFacility]);

  const facilityColorMap = useMemo(() => {
    const map: Record<string, number> = {};

    facilities.forEach((f, i) => {
      map[f.id] = i % FACILITY_COLORS.length;
    });

    return map;
  }, [facilities]);

  const selectedColor = useMemo(() => {
    const idx =
      selectedFacility !== null ? (facilityColorMap[selectedFacility] ?? 0) : 0;

    return getFacilityColor(idx);
  }, [facilities, selectedFacility, facilityColorMap]);

  const uniqueBookings = useMemo(() => {
    const groupCounts: Record<string, number> = {};

    for (const b of bookings) {
      if (b.recurrenceGroupId) {
        groupCounts[b.recurrenceGroupId] =
          (groupCounts[b.recurrenceGroupId] || 0) + 1;
      }
    }

    const seen = new Set<string>();
    const unique: (Booking & { _groupTotal?: number })[] = [];

    for (const b of bookings) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        unique.push({
          ...b,
          _groupTotal: b.recurrenceGroupId
            ? groupCounts[b.recurrenceGroupId]
            : undefined,
        });
      }
    }
    unique.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return unique;
  }, [bookings]);

  const compactedByDate = useMemo(() => {
    const grouped: Record<string, (Booking & { _groupTotal?: number })[]> = {};

    for (const b of uniqueBookings) {
      const dateKey = new Date(b.startTime).toLocaleDateString(LOCALE, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    }

    return Object.fromEntries(
      Object.entries(grouped).map(([date, dayBookings]) => {
        const slotMap = new Map<
          string,
          (Booking & { _groupTotal?: number })[]
        >();

        for (const booking of dayBookings) {
          const slotKey = `${booking.startTime}-${booking.endTime}`;
          const slotBookings = slotMap.get(slotKey) || [];

          slotBookings.push(booking);
          slotMap.set(slotKey, slotBookings);
        }

        return [date, Array.from(slotMap.values())];
      }),
    );
  }, [uniqueBookings]);

  const selectedName =
    facilities.find((f) => f.id === selectedFacility)?.name || "Select a Room";

  return {
    facilities,
    selectedFacility,
    loading,
    fetchError,
    bookingsLoading,
    selectedColor,
    uniqueBookings,
    compactedByDate,
    selectedName,
    setSelectedFacility,
  };
}
