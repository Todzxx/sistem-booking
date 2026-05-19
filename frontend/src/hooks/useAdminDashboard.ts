import type { StatusFilter } from "@/components/admin/AdminFilterBar";
import type { Booking, BookingStatus } from "@/types";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useOverlayState } from "@heroui/react";

import api from "@/config/api";

export function useAdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [facilityFilter, setFacilityFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [notifications, setNotifications] = useState<
    { id: number; type: "error" | "validation"; message: string }[]
  >([]);

  const [notes, setNotes] = useState("");
  const [modalError, setModalError] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: BookingStatus;
  } | null>(null);

  const noteModal = useOverlayState();

  const pushAdminNotification = useCallback(
    (type: "error" | "validation", message: string) => {
      setNotifications((current) =>
        [{ id: Date.now(), type, message }, ...current].slice(0, 5),
      );
    },
    [],
  );

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/bookings?limit=100");
      const data = response.data.data?.items || response.data.data || [];

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching bookings", err);
      pushAdminNotification("error", "Failed to fetch booking data.");
    } finally {
      setLoading(false);
    }
  }, [pushAdminNotification]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const handleUpdateStatusInit = useCallback(
    (id: string, status: BookingStatus, adminNote?: string) => {
      if (
        status === "REJECTED" &&
        adminNote !== undefined &&
        !adminNote.trim()
      ) {
        setModalError("Admin note is required when rejecting a booking.");

        return;
      }

      if (adminNote === undefined) {
        setPendingAction({ id, status });
        setNotes("");
        setModalError("");
        noteModal.open();

        return;
      }

      setActionLoading(id);
      api
        .patch(`/bookings/${id}/status`, { status, notes: adminNote })
        .then(() => fetchAllBookings())
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error("Error updating status", err);
          const message =
            (err as any)?.response?.data?.message ||
            "Failed to update booking status.";

          pushAdminNotification("error", message);
        })
        .finally(() => setActionLoading(null));
    },
    [fetchAllBookings, pushAdminNotification, noteModal],
  );

  const handleModalConfirm = useCallback(
    (id: string, status: BookingStatus, note: string) => {
      if (status === "REJECTED" && !note.trim()) {
        setModalError("Admin note is required when rejecting a booking.");

        return;
      }
      handleUpdateStatusInit(id, status, note);
      noteModal.close();
    },
    [handleUpdateStatusInit, noteModal],
  );

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const approved = bookings.filter((b) => b.status === "APPROVED").length;
    const rejected = bookings.filter((b) => b.status === "REJECTED").length;

    const facilityMap: Record<string, number> = {};

    bookings.forEach((b: any) => {
      const name = b.facility?.name ?? "Unknown";

      facilityMap[name] = (facilityMap[name] || 0) + 1;
    });
    const facilityStats = Object.entries(facilityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const hourMap: Record<string, number> = {};

    bookings.forEach((b) => {
      const hour =
        new Date(b.startTime).getHours().toString().padStart(2, "0") + ":00";

      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      total,
      pending,
      approved,
      rejected,
      facilityStats,
      approvalRate,
      peakHours,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase();

    return bookings.filter((b: any) => {
      const bookingDate = new Date(b.startTime).toISOString().slice(0, 10);
      const matchSearch =
        !q ||
        b.purpose?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.facility?.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchFacility =
        facilityFilter === "ALL" || b.facility?.name === facilityFilter;
      const matchDate = !dateFilter || bookingDate === dateFilter;

      return matchSearch && matchStatus && matchFacility && matchDate;
    });
  }, [bookings, search, statusFilter, facilityFilter, dateFilter]);

  const chartColors = [
    "var(--heroui-primary)",
    "var(--heroui-success)",
    "var(--heroui-warning)",
    "var(--heroui-danger)",
    "var(--heroui-secondary)",
  ];

  const hasFilters = !!(
    search ||
    statusFilter !== "ALL" ||
    facilityFilter !== "ALL" ||
    dateFilter
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setFacilityFilter("ALL");
    setDateFilter("");
  };

  const dismissNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  return {
    bookings,
    loading,
    actionLoading,
    search,
    statusFilter,
    facilityFilter,
    dateFilter,
    stats,
    filteredBookings,
    hasFilters,
    chartColors,
    notifications,
    notes,
    modalError,
    pendingAction,
    noteModal,
    setSearch,
    setStatusFilter,
    setFacilityFilter,
    setDateFilter,
    setNotes,
    setModalError,
    clearFilters,
    dismissNotification,
    handleUpdateStatusInit,
    handleModalConfirm,
  };
}
