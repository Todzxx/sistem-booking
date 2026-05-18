import { Card, Chip, Button } from "@heroui/react";
import { User, MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react";

import { Booking, BookingStatus } from "@/types";
import { formatDateTime } from "@/utils/dateUtils";
import { LOCALE } from "@/config/locale";

interface AdminBookingCardProps {
  booking: Booking & { [key: string]: any };
  actionLoading: string | null;
  onUpdateStatus: (
    id: string,
    status: BookingStatus,
    adminNote?: string,
  ) => void;
}

function getStatusColor(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
}

export default function AdminBookingCard({
  booking,
  actionLoading,
  onUpdateStatus,
}: AdminBookingCardProps) {
  return (
    <Card className="p-6 border border-default-200 rounded-xl bg-background/60 backdrop-blur-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Chip
              className="font-black"
              color={getStatusColor(booking.status)}
              size="sm"
              variant="soft"
            >
              {booking.status}
            </Chip>
            <span className="text-xs font-bold text-default-400 tracking-widest uppercase">
              #{booking.id.substring(0, 8)}
            </span>
          </div>

          <h3 className="text-xl font-black text-foreground truncate">
            {booking.purpose}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-default-600 min-w-0">
              <User className="text-primary shrink-0" size={15} />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-default-400">
                  Reserved By
                </p>
                <p className="text-xs font-bold truncate">
                  {booking.user?.name}
                </p>
                <p className="text-[10px] text-default-400 truncate">
                  {booking.user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-default-600 min-w-0">
              <MapPin className="text-primary shrink-0" size={15} />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-default-400">
                  Facility
                </p>
                <p className="text-xs font-bold truncate">
                  {booking.facility?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-default-600 min-w-0">
              <Calendar className="text-primary shrink-0" size={15} />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-default-400">
                  Time Window
                </p>
                <p className="text-xs font-bold">
                  {formatDateTime(booking.startTime)}
                </p>
                <p className="text-[10px] text-default-400">
                  →{" "}
                  {new Date(booking.endTime).toLocaleTimeString(LOCALE, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {booking.status === "PENDING" && (
            <>
              <Button
                className="h-11 px-5 rounded-2xl font-black text-xs shadow-lg shadow-success/20"
                isPending={actionLoading === booking.id}
                variant="primary"
                onPress={() => onUpdateStatus(booking.id, "APPROVED")}
              >
                <CheckCircle2 className="mr-1.5" size={16} />
                Approve
              </Button>
              <Button
                className="h-11 px-5 rounded-2xl font-black text-xs shadow-lg shadow-danger/20"
                isPending={actionLoading === booking.id}
                variant="danger-soft"
                onPress={() => onUpdateStatus(booking.id, "REJECTED")}
              >
                <XCircle className="mr-1.5" size={16} />
                Reject
              </Button>
            </>
          )}
          {booking.status !== "PENDING" && (
            <div className="text-default-300 font-bold italic text-sm px-4">
              Processed
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
