import type { Booking, Facility } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

import api from "@/config/api";
import { LOCALE } from "@/config/locale";
import { extractCollection } from "@/utils/apiData";
import {
  FacilitySidebar,
  FACILITY_COLORS,
  getFacilityColor,
  TimelineCard,
} from "@/components/calendar";

export default function CalendarPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Calendar size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Facility Schedule
          </h1>
          <p className="text-default-400 text-sm font-medium">
            Check real-time availability and planned usage.
          </p>
        </div>
      </div>
      <div className="h-0.5 w-12 rounded-full bg-primary/20" />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FacilitySidebar
          error={fetchError}
          facilities={facilities}
          loading={loading}
          selectedFacility={selectedFacility}
          onSelect={setSelectedFacility}
        />

        <TimelineCard
          bookingsLoading={bookingsLoading}
          color={selectedColor}
          compactedByDate={compactedByDate}
          selectedName={selectedName}
          uniqueBookings={uniqueBookings}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}
