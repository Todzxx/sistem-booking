import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

import { FacilitySidebar, TimelineCard } from "@/components/calendar";
import { useCalendarData } from "@/hooks/useCalendarData";

export default function CalendarPage() {
  const navigate = useNavigate();
  const {
    facilities,
    selectedFacility,
    loading,
    fetchError,
    bookingsLoading,
    selectedColor,
    uniqueBookings,
    compactedByDate,
    selectedName,
    setSelectedFacility,
  } = useCalendarData();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Calendar size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Facility Schedule
          </h1>
          <p className="text-default-400 text-sm font-medium">
            Check real-time availability and planned usage.
          </p>
        </div>
      </div>
      <div className="h-0.5 w-12 rounded-full bg-primary/20" />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FacilitySidebar
          error={fetchError}
          facilities={facilities}
          loading={loading}
          selectedFacility={selectedFacility}
          onSelect={setSelectedFacility}
        />

        <TimelineCard
          bookingsLoading={bookingsLoading}
          color={selectedColor}
          compactedByDate={compactedByDate}
          selectedName={selectedName}
          uniqueBookings={uniqueBookings}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}
