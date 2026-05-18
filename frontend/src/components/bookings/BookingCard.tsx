import type { Booking, BookingStatus } from "@/types";

import { Calendar, Clock, MapPin, XCircle } from "lucide-react";
import { Card, Chip, Button } from "@heroui/react";

const STATUS_STYLES: Record<
  BookingStatus,
  {
    color: "warning" | "success" | "danger" | "default";
    label: string;
    border: string;
  }
> = {
  PENDING: { color: "warning", label: "Pending", border: "border-l-warning" },
  APPROVED: { color: "success", label: "Approved", border: "border-l-success" },
  REJECTED: { color: "danger", label: "Rejected", border: "border-l-danger" },
  CANCELLED: {
    color: "default",
    label: "Cancelled",
    border: "border-l-default-300",
  },
};

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  onPayDeposit?: (id: string) => Promise<void>;
}

export default function BookingCard({
  booking,
  onCancel,
  onPayDeposit,
}: BookingCardProps) {
  const style =
    STATUS_STYLES[booking.status as BookingStatus] || STATUS_STYLES.CANCELLED;

  return (
    <Card
      className={`relative overflow-hidden rounded-xl border border-default-200 border-l-4 ${style.border} transition-all hover:border-default-300`}
    >
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <MapPin className="text-primary shrink-0" size={16} />
            <p className="font-black text-base text-foreground truncate">
              {booking.facility?.name || "Unknown Facility"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-default-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {booking.startTime
                ? new Date(booking.startTime).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {booking.startTime
                ? new Date(booking.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
              {" — "}
              {booking.endTime
                ? new Date(booking.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>

          {booking.purpose && (
            <p className="text-sm text-default-500 font-medium leading-snug line-clamp-1">
              {booking.purpose}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Chip
            className="font-bold text-[11px] px-2.5 h-6"
            color={style.color}
            size="sm"
            variant="soft"
          >
            {style.label}
          </Chip>
          {booking.status === "PENDING" && onCancel && (
            <Button
              isIconOnly
              aria-label="Cancel booking"
              className="text-danger/60 hover:text-danger hover:bg-danger/5 rounded-lg h-8 w-8 min-w-0"
              size="sm"
              variant="ghost"
              onPress={() => onCancel(booking.id)}
            >
              <XCircle size={16} />
            </Button>
          )}
          {booking.status === "APPROVED" &&
            booking.paymentStatus === "UNPAID" &&
            booking.depositAmount &&
            parseFloat(booking.depositAmount) > 0 &&
            onPayDeposit && (
              <Button
                className="font-bold text-[10px] h-7 px-3 rounded-lg"
                size="sm"
                variant="primary"
                onPress={() => onPayDeposit(booking.id)}
              >
                Pay Deposit
              </Button>
            )}
          {booking.paymentStatus === "PAID" && (
            <Chip
              className="font-bold text-[9px] h-5 px-1.5"
              color="success"
              size="sm"
              variant="soft"
            >
              PAID
            </Chip>
          )}
        </div>
      </div>
    </Card>
  );
}
