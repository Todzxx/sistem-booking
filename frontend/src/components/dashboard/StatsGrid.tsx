import { Card } from "@heroui/react";
import { LayoutGrid, ClipboardList, Calendar } from "lucide-react";

const STAT_COLORS: Record<string, { bg: string; text: string; icon: string }> =
  {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: "text-primary",
    },
    secondary: {
      bg: "bg-secondary/10",
      text: "text-secondary",
      icon: "text-secondary",
    },
    success: {
      bg: "bg-success/10",
      text: "text-success",
      icon: "text-success",
    },
  };

interface StatsGridProps {
  totalFacilities: number;
  myBookings: number;
  upcoming: number;
}

export default function StatsGrid({
  totalFacilities,
  myBookings,
  upcoming,
}: StatsGridProps) {
  const stats = [
    {
      label: "Available Spaces",
      value: totalFacilities,
      icon: LayoutGrid,
      color: "primary" as const,
    },
    {
      label: "Total Bookings",
      value: myBookings,
      icon: ClipboardList,
      color: "secondary" as const,
    },
    {
      label: "Upcoming Events",
      value: upcoming,
      icon: Calendar,
      color: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => {
        const colors = STAT_COLORS[stat.color];

        return (
          <Card
            key={i}
            className="p-6 border border-default-200 bg-background/60 backdrop-blur-md transition-all group overflow-hidden hover:border-default-300"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
              <stat.icon className={colors.text} size={100} />
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${colors.bg} ${colors.icon}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-black text-default-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
