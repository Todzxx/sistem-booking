import type { Booking } from "@/types";

import { Card, Button } from "@heroui/react";
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

import TimelineEvent from "./TimelineEvent";

interface FacilityColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
  activeBg: string;
  strip: string;
}

interface TimelineCardProps {
  selectedName: string;
  uniqueBookings: (Booking & { _groupTotal?: number })[];
  compactedByDate: Record<string, (Booking & { _groupTotal?: number })[][]>;
  bookingsLoading: boolean;
  color: FacilityColor;
  onNavigate: (path: string) => void;
}

export default function TimelineCard({
  selectedName,
  uniqueBookings,
  compactedByDate,
  bookingsLoading,
  color,
  onNavigate,
}: TimelineCardProps) {
  const approvedCount = uniqueBookings.filter(
    (b) => b.status === "APPROVED",
  ).length;
  const pendingCount = uniqueBookings.filter(
    (b) => b.status === "PENDING",
  ).length;

  return (
    <div className="flex-1 min-w-0">
      <Card className="rounded-xl border border-default-200 bg-background/60 backdrop-blur-md overflow-hidden min-h-[480px]">
        <Card.Header
          className={`px-8 py-6 border-b border-default-100 flex flex-col gap-4`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`p-3 ${color.bg} rounded-lg ${color.text} shrink-0`}
              >
                <Calendar size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-foreground tracking-tight">
                  Timeline Overview
                </h3>
                <p
                  className={`text-xs font-bold uppercase tracking-widest truncate ${color.text}`}
                >
                  {selectedName}
                </p>
              </div>
            </div>
            {uniqueBookings.length > 0 && (
              <span className="shrink-0 text-[10px] font-bold text-default-400 bg-default-100 px-3 py-1.5 rounded-xl whitespace-nowrap">
                {uniqueBookings.length} events
              </span>
            )}
          </div>

          {uniqueBookings.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${color.bg} ${color.border} border`}
              >
                <TrendingUp className={`shrink-0 ${color.text}`} size={14} />
                <div>
                  <p className="text-[9px] font-black text-default-400 uppercase tracking-widest">
                    Total
                  </p>
                  <p className={`text-sm font-black ${color.text}`}>
                    {uniqueBookings.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 className="shrink-0 text-success" size={14} />
                <div>
                  <p className="text-[9px] font-black text-default-400 uppercase tracking-widest">
                    Approved
                  </p>
                  <p className="text-sm font-black text-success">
                    {approvedCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
                <AlertCircle className="shrink-0 text-warning" size={14} />
                <div>
                  <p className="text-[9px] font-black text-default-400 uppercase tracking-widest">
                    Pending
                  </p>
                  <p className="text-sm font-black text-warning">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card.Header>

        <Card.Content className="p-0">
          {bookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div
                className={`animate-spin rounded-full h-10 w-10 border-b-4 ${color.text.replace("text-", "border-")}`}
              />
              <p className="text-default-400 font-bold uppercase tracking-widest text-[10px]">
                Syncing Schedule...
              </p>
            </div>
          ) : uniqueBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div
                className={`w-20 h-20 ${color.bg} rounded-xl flex items-center justify-center mb-6 border-2 ${color.border} ${color.text}`}
              >
                <Clock size={36} />
              </div>
              <p className="text-xl font-black text-default-400">Empty Slots</p>
              <p className="text-default-400 font-medium mt-2 max-w-xs">
                <span className={`font-black ${color.text}`}>
                  {selectedName}
                </span>{" "}
                is fully available. Be the first to reserve it!
              </p>
              <Button
                className="mt-6 h-11 rounded-lg font-bold px-8 transition-all active:scale-[0.98]"
                variant="primary"
                onPress={() => onNavigate("/facilities")}
              >
                <Calendar size={16} />
                Book Now
              </Button>
            </div>
          ) : (
            <div className="flex flex-col">
              {Object.entries(compactedByDate).map(([date, daySlots]) => (
                <div key={date}>
                  <div
                    className={`px-6 py-3 border-y border-default-200 flex items-center justify-between gap-2 ${color.bg}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`}
                      />
                      <span className="text-xs font-black text-default-600">
                        {date}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] font-bold ${color.text} ${color.bg} px-2 py-0.5 rounded-full border ${color.border}`}
                    >
                      {daySlots.reduce(
                        (
                          total: number,
                          slot: (Booking & { _groupTotal?: number })[],
                        ) => total + slot.length,
                        0,
                      )}{" "}
                      event{daySlots.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {daySlots.map(
                    (slotBookings: (Booking & { _groupTotal?: number })[]) => (
                      <TimelineEvent
                        key={`${slotBookings[0].startTime}-${slotBookings[0].endTime}-${slotBookings.length}`}
                        bookings={slotBookings}
                        color={color}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
