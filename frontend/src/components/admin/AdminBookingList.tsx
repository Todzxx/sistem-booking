import { Button, Card } from "@heroui/react";
import { AlertCircle } from "lucide-react";

import AdminBookingCard from "./AdminBookingCard";

import { Booking, BookingStatus } from "@/types";

interface AdminBookingListProps {
  bookings: (Booking & { [key: string]: any })[];
  filteredBookings: (Booking & { [key: string]: any })[];
  loading: boolean;
  actionLoading: string | null;
  hasFilters: boolean;
  onUpdateStatus: (
    id: string,
    status: BookingStatus,
    adminNote?: string,
  ) => void;
  onClearFilters: () => void;
}

export default function AdminBookingList({
  bookings,
  filteredBookings,
  loading,
  actionLoading,
  hasFilters,
  onUpdateStatus,
  onClearFilters,
}: AdminBookingListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 bg-default-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <Card className="p-8 text-center bg-default-50/50 border-2 border-dashed border-default-200 rounded-xl">
        <AlertCircle className="mx-auto text-default-300 mb-4" size={48} />
        <p className="text-xl font-black text-default-400">
          {hasFilters
            ? "No bookings match your filter."
            : "No booking requests found."}
        </p>
        {hasFilters && (
          <Button
            className="mt-4 text-sm font-bold text-primary underline bg-transparent"
            variant="ghost"
            onPress={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold text-default-400">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>
      {filteredBookings.map((booking) => (
        <AdminBookingCard
          key={booking.id}
          actionLoading={actionLoading}
          booking={booking}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
