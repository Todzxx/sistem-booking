import { Card } from "@heroui/react";
import { CalendarRange } from "lucide-react";

export default function BookingsEmptyState() {
  return (
    <Card
      className="py-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-default-200 rounded-xl"
      role="status"
    >
      <div className="w-14 h-14 rounded-xl bg-default-100 flex items-center justify-center mb-4">
        <CalendarRange className="text-default-300" size={28} />
      </div>
      <p className="text-default-500 text-lg font-black">No bookings yet</p>
      <p className="text-default-400 text-sm font-medium mt-1">
        Browse facilities and book a space to get started.
      </p>
    </Card>
  );
}
