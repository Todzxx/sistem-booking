import type { Booking } from "@/types";

import BookingCard from "./BookingCard";

interface BookingsListProps {
  bookings: Booking[];
  onCancel?: (id: string) => void;
  onPayDeposit?: (id: string) => Promise<void>;
}

export default function BookingsList({
  bookings,
  onCancel,
  onPayDeposit,
}: BookingsListProps) {
  return (
    <div className="grid gap-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancel}
          onPayDeposit={onPayDeposit}
        />
      ))}
    </div>
  );
}
