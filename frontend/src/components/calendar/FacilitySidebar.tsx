import type { Facility } from "@/types";

import { Button } from "@heroui/react";
import { Search, ChevronRight, AlertCircle } from "lucide-react";

export const FACILITY_COLORS = [
  {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-500",
    dot: "bg-blue-500",
    activeBg: "bg-blue-600",
    strip: "border-l-blue-500",
  },
  {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    dot: "bg-emerald-500",
    activeBg: "bg-emerald-600",
    strip: "border-l-emerald-500",
  },
  {
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-500",
    dot: "bg-violet-500",
    activeBg: "bg-violet-600",
    strip: "border-l-violet-500",
  },
  {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-500",
    dot: "bg-orange-500",
    activeBg: "bg-orange-600",
    strip: "border-l-orange-500",
  },
  {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-500",
    dot: "bg-rose-500",
    activeBg: "bg-rose-600",
    strip: "border-l-rose-500",
  },
  {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-500",
    dot: "bg-cyan-500",
    activeBg: "bg-cyan-600",
    strip: "border-l-cyan-500",
  },
];

interface FacilityColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
  activeBg: string;
  strip: string;
}

export function getFacilityColor(fallbackIndex: number): FacilityColor {
  return FACILITY_COLORS[fallbackIndex % FACILITY_COLORS.length];
}

interface FacilitySidebarProps {
  facilities: Facility[];
  selectedFacility: string | null;
  loading: boolean;
  error: string;
  onSelect: (id: string) => void;
}

export default function FacilitySidebar({
  facilities,
  selectedFacility,
  loading,
  error,
  onSelect,
}: FacilitySidebarProps) {
  return (
    <aside className="w-full lg:w-52 shrink-0 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-default-400 px-1">
        <Search size={14} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          Rooms &amp; Spaces
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div
            aria-label="Loading facilities"
            className="animate-pulse flex flex-col gap-2"
            role="status"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-default-100 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div
            className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg flex items-center gap-2 text-sm font-bold"
            role="alert"
          >
            <AlertCircle size={16} />
            {error}
          </div>
        ) : facilities.length === 0 ? (
          <p className="text-default-400 text-sm font-medium px-1">
            No facilities available.
          </p>
        ) : (
          facilities.map((f, idx) => {
            const color = getFacilityColor(idx);
            const isSelected = selectedFacility === f.id;

            return (
              <Button
                key={f.id}
                aria-selected={isSelected}
                className={`
                  w-full text-left flex items-center gap-3
                  px-4 py-3 rounded-lg border-2 transition-all duration-200
                  ${
                    isSelected
                      ? `${color.activeBg} text-white border-transparent`
                      : `bg-background ${color.border}`
                  }
                `}
                variant="ghost"
                onPress={() => onSelect(f.id)}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isSelected ? "bg-white/70" : color.dot
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-black text-xs truncate ${
                      isSelected ? "text-white" : "text-default-700"
                    }`}
                  >
                    {f.name}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-widest ${
                      isSelected ? "text-white/60" : "text-default-400"
                    }`}
                  >
                    {f.capacity} seats
                  </p>
                </div>
                {isSelected && (
                  <ChevronRight className="shrink-0 text-white/70" size={14} />
                )}
              </Button>
            );
          })
        )}
      </div>

      {!loading && facilities.length > 0 && (
        <div className="mt-2 p-3 bg-default-50 rounded-lg border border-default-100">
          <p className="text-[9px] font-black text-default-400 uppercase tracking-widest mb-2">
            Facility Colors
          </p>
          <div className="flex flex-col gap-1.5">
            {facilities.map((f, idx) => {
              const color = getFacilityColor(idx);

              return (
                <div key={f.id} className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`}
                  />
                  <span className="text-[9px] font-bold text-default-500 truncate">
                    {f.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-default-200">
            <p className="text-[9px] font-black text-default-400 uppercase tracking-widest mb-2">
              Booking Status
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="text-[9px] font-bold text-default-500">
                  Approved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                <span className="text-[9px] font-bold text-default-500">
                  Pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                <span className="text-[9px] font-bold text-default-500">
                  Rejected / Cancelled
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
