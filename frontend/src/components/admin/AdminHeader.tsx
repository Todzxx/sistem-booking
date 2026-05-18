import { Button } from "@heroui/react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Booking } from "@/types";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";

interface AdminHeaderProps {
  filteredBookings: Booking[];
}

export default function AdminHeader({ filteredBookings }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted font-medium text-lg">
          Manage reservations and monitor facility usage.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className="h-11 px-4 rounded-2xl font-black text-xs border-default-200 gap-2 shrink-0"
          variant="ghost"
          onPress={() => exportToCSV(filteredBookings)}
        >
          <Download size={16} />
          CSV
        </Button>
        <Button
          className="h-11 px-4 rounded-2xl font-black text-xs border-default-200 gap-2 shrink-0"
          variant="ghost"
          onPress={() => exportToExcel(filteredBookings)}
        >
          <FileSpreadsheet size={16} />
          Excel
        </Button>
        <Button
          className="h-11 px-4 rounded-2xl font-black text-xs border-default-200 gap-2 shrink-0"
          variant="ghost"
          onPress={() => exportToPDF(filteredBookings)}
        >
          <FileText size={16} />
          PDF
        </Button>
      </div>
    </div>
  );
}
