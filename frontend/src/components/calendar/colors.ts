export interface FacilityColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
  activeBg: string;
  strip: string;
}

export const FACILITY_COLORS: FacilityColor[] = [
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

export function getFacilityColor(fallbackIndex: number): FacilityColor {
  return FACILITY_COLORS[fallbackIndex % FACILITY_COLORS.length];
}
