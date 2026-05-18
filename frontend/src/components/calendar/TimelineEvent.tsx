import type { Booking, BookingStatus } from "@/types";

import { Chip } from "@heroui/react";
import { Hash, Clock, User, RefreshCw } from "lucide-react";

const STATUS_CHIP_COLORS: Record<
  BookingStatus,
  "success" | "warning" | "danger"
> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELLED: "danger",
};

interface FacilityColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
  activeBg: string;
  strip: string;
}

interface TimelineEventProps {
  bookings: (Booking & { _groupTotal?: number })[];
  color: FacilityColor;
}

export default function TimelineEvent({ bookings, color }: TimelineEventProps) {
  const b = bookings[0];
  const now = new Date();
  const start = new Date(b.startTime);
  const end = new Date(b.endTime);
  const isLive = now >= start && now <= end;
  const durationMins = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60),
  );
  const isCompact = bookings.length > 1;
  const slotTitle = bookings
    .map(
      (item) =>
        `${item.purpose} - ${item.user?.name || "Member"} (${item.status})`,
    )
    .join("\n");

  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center gap-4
        px-6 py-4 border-b border-default-100 last:border-0
        hover:bg-default-50 transition-colors duration-200
        ${isLive ? `border-l-4 ${color.strip} ${color.bg}` : "border-l-4 border-transparent"}
      `}
      title={slotTitle}
    >
      <div
        className={`hidden sm:block w-1 self-stretch rounded-full shrink-0 ${color.dot} opacity-40`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Hash className={`${color.text} shrink-0`} size={10} />
          <span className="text-[9px] font-black text-default-300 uppercase tracking-widest">
            #{b.id.substring(0, 8)}
          </span>
          {isLive && (
            <Chip
              className="h-4 text-[7px] font-black animate-pulse"
              color="danger"
              size="sm"
              variant="soft"
            >
              LIVE
            </Chip>
          )}
        </div>
        <p className="text-sm font-black text-foreground truncate mb-1.5">
          {isCompact ? `${bookings.length} bookings in this slot` : b.purpose}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {isCompact && (
            <Chip
              className={`h-5 text-[8px] font-black uppercase px-2 ${color.text}`}
              size="sm"
              variant="soft"
            >
              Hover for details
            </Chip>
          )}
          <Chip
            className="h-5 text-[8px] font-black uppercase px-2"
            color={STATUS_CHIP_COLORS[b.status as BookingStatus] ?? "danger"}
            size="sm"
            variant="soft"
          >
            {b.status}
          </Chip>
          {b._groupTotal && b._groupTotal > 1 && (
            <Chip
              className={`h-5 text-[8px] font-black uppercase px-2 ${color.text}`}
              size="sm"
              variant="soft"
            >
              <RefreshCw className="mr-0.5" size={7} />
              {b._groupTotal}-series
            </Chip>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-0.5 sm:text-right">
        <div className="flex items-center gap-1.5 font-black text-sm text-default-700">
          <Clock className={`${color.text} shrink-0`} size={12} />
          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" — "}
          {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <p className="text-[9px] font-bold text-default-400 pl-[18px] uppercase">
          {durationMins} min
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black text-foreground">
            {b.user?.name || "Member"}
          </p>
          <p className="text-[9px] font-bold text-default-400">Verified</p>
        </div>
        <div
          className={`w-8 h-8 rounded-xl ${color.bg} flex items-center justify-center ${color.text} border ${color.border} shrink-0`}
        >
          <User size={14} />
        </div>
      </div>
    </div>
  );
}
