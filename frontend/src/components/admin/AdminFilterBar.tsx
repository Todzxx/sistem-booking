import {
  Button,
  Label,
  Select,
  TextField,
  InputGroup,
  ListBox,
} from "@heroui/react";
import { Search } from "lucide-react";

import { Booking } from "@/types";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];

interface AdminFilterBarProps {
  search: string;
  statusFilter: StatusFilter;
  facilityFilter: string;
  dateFilter: string;
  bookings: Booking[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onFacilityFilterChange: (facility: string) => void;
  onDateFilterChange: (date: string) => void;
}

export default function AdminFilterBar({
  search,
  statusFilter,
  facilityFilter,
  dateFilter,
  bookings,
  onSearchChange,
  onStatusFilterChange,
  onFacilityFilterChange,
  onDateFilterChange,
}: AdminFilterBarProps) {
  const facilityOptions = Array.from(
    new Set(bookings.map((b: any) => b.facility?.name).filter(Boolean)),
  ).sort();

  return (
    <div className="flex flex-col gap-3">
      <InputGroup className="rounded-2xl border-default-200 flex-1">
        <InputGroup.Prefix className="pl-3">
          <Search className="text-default-400" size={16} />
        </InputGroup.Prefix>
        <InputGroup.Input
          placeholder="Search by purpose, user, room..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="sr-only">Room</Label>
          <Select
            aria-label="Filter by room"
            className="rounded-xl"
            selectedKey={facilityFilter}
            onSelectionChange={(key) => onFacilityFilterChange(key as string)}
          >
            <Select.Trigger className="h-11 rounded-xl px-4">
              <Select.Value />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="ALL" textValue="All rooms">
                  All rooms
                </ListBox.Item>
                {facilityOptions.map((name) => (
                  <ListBox.Item key={name} id={name} textValue={name}>
                    {name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="sr-only">Date</Label>
          <TextField
            aria-label="Filter by date"
            type="date"
            value={dateFilter}
            onChange={(value) => onDateFilterChange(value)}
          />
        </div>
      </div>
      <div
        aria-label="Filter by status"
        className="flex gap-2 flex-wrap"
        role="tablist"
      >
        {STATUS_FILTERS.map((s) => {
          const isActive = statusFilter === s;
          const activeClass =
            s === "ALL"
              ? "bg-primary text-white border-primary"
              : s === "PENDING"
                ? "bg-warning text-white border-warning"
                : s === "APPROVED"
                  ? "bg-success text-white border-success"
                  : "bg-danger text-white border-danger";

          return (
            <Button
              key={s}
              aria-selected={isActive}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${
                isActive
                  ? activeClass
                  : "bg-background border-default-200 text-default-500"
              }`}
              variant="ghost"
              onPress={() => onStatusFilterChange(s)}
            >
              {s}
              {s !== "ALL" && (
                <span className="ml-1.5 opacity-70">
                  ({bookings.filter((b) => b.status === s).length})
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
