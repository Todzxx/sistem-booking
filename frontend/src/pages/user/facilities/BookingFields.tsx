import type { BookingData } from "./types";

import { useMemo } from "react";
import {
  TextField,
  Label,
  InputGroup,
  Checkbox,
  Select,
  ListBox,
  TextArea,
} from "@heroui/react";
import { Clock } from "lucide-react";

import {
  formatTimeRange,
  isOverlappingSlot,
  getDateRange,
  ACTIVE_BOOKING_STATUSES,
} from "./helpers";

interface BookingFieldsProps {
  purpose: string;
  startTime: string;
  endTime: string;
  bookingDate: string;
  isRecurring: boolean;
  recurrenceType: string;
  recurrenceCount: number;
  facilityBookings: BookingData[];
  facilityBookingsLoading: boolean;
  onPurposeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onBookingDateChange: (value: string) => void;
  onRecurringChange: (value: boolean) => void;
  onRecurrenceTypeChange: (value: string) => void;
  onRecurrenceCountChange: (value: number) => void;
}

export function BookingFields({
  purpose,
  startTime,
  endTime,
  bookingDate,
  isRecurring,
  recurrenceType,
  recurrenceCount,
  facilityBookings,
  facilityBookingsLoading,
  onPurposeChange,
  onStartTimeChange,
  onEndTimeChange,
  onBookingDateChange,
  onRecurringChange,
  onRecurrenceTypeChange,
  onRecurrenceCountChange,
}: BookingFieldsProps) {
  const { dayStart, dayEnd } = getDateRange(bookingDate);

  const occupiedBookingsForSelectedDate = useMemo(
    () =>
      facilityBookings
        .filter(
          (booking: BookingData) =>
            ACTIVE_BOOKING_STATUSES.has(booking.status) &&
            isOverlappingSlot(booking, dayStart, dayEnd),
        )
        .sort(
          (a: BookingData, b: BookingData) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    [facilityBookings, dayStart, dayEnd],
  );

  const selectedTimeConflict = useMemo(
    () =>
      !!startTime &&
      !!endTime &&
      facilityBookings.some((booking: BookingData) =>
        isOverlappingSlot(booking, new Date(startTime), new Date(endTime)),
      ),
    [startTime, endTime, facilityBookings],
  );

  return (
    <>
      <div className="space-y-3 rounded-lg border border-default-200 bg-default-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-default-700">
              Slot Availability
            </p>
            <p className="text-[11px] font-bold text-default-400">
              Booked times for the selected date.
            </p>
          </div>
          <Clock className="text-primary shrink-0" size={16} />
        </div>

        <TextField aria-label="Booking date" name="bookingDate" type="date">
          <InputGroup.Input
            className="rounded-lg"
            value={bookingDate}
            onChange={(e) => {
              onBookingDateChange(e.target.value);
              onStartTimeChange("");
              onEndTimeChange("");
            }}
          />
        </TextField>

        {facilityBookingsLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 rounded-lg bg-default-100 animate-pulse"
              />
            ))}
          </div>
        ) : occupiedBookingsForSelectedDate.length === 0 ? (
          <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs font-bold text-success">
            No pending or approved bookings for this date.
          </div>
        ) : (
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {occupiedBookingsForSelectedDate.map((booking: BookingData) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-danger"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </p>
                  <p className="truncate text-[10px] font-bold opacity-80">
                    {booking.purpose || "Booked"}
                  </p>
                </div>
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <TextArea
          aria-label="Event purpose"
          className="rounded-lg w-full text-left"
          placeholder="What's the occasion?"
          value={purpose}
          onChange={(e) => onPurposeChange(e.target.value)}
        />

        <div className="flex flex-col gap-4 p-4 bg-default-50 rounded-lg border border-default-100">
          <Checkbox isSelected={isRecurring} onChange={onRecurringChange}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label className="text-sm font-bold">Recurring Booking</Label>
            </Checkbox.Content>
          </Checkbox>

          {isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-black uppercase text-default-400 ml-1">
                  Type
                </Label>
                <Select
                  aria-label="Recurrence type"
                  className="rounded-lg"
                  placeholder="Select type"
                  value={recurrenceType}
                  onChange={(key) => onRecurrenceTypeChange(key as string)}
                >
                  <Select.Trigger className="w-full">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="DAILY" textValue="Daily">
                        Daily
                      </ListBox.Item>
                      <ListBox.Item id="WEEKLY" textValue="Weekly">
                        Weekly
                      </ListBox.Item>
                      <ListBox.Item id="MONTHLY" textValue="Monthly">
                        Monthly
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-black uppercase text-default-400 ml-1">
                  Count (Max 12)
                </Label>
                <TextField
                  aria-label="Recurrence count"
                  name="recurrenceCount"
                  type="number"
                >
                  <InputGroup.Input
                    className="rounded-lg"
                    max={12}
                    min={1}
                    type="number"
                    value={recurrenceCount.toString()}
                    onChange={(e) =>
                      onRecurrenceCountChange(
                        Math.min(12, parseInt(e.target.value) || 1),
                      )
                    }
                  />
                </TextField>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TextField isRequired name="startTime" type="datetime-local">
            <Label className="text-sm font-black text-default-700 ml-1">
              Start Time
            </Label>
            <InputGroup.Input
              className="rounded-lg"
              value={startTime}
              onChange={(e) => {
                onStartTimeChange(e.target.value);
                if (e.target.value) {
                  onBookingDateChange(e.target.value.slice(0, 10));
                }
              }}
            />
          </TextField>
          <TextField isRequired name="endTime" type="datetime-local">
            <Label className="text-sm font-black text-default-700 ml-1">
              End Time
            </Label>
            <InputGroup.Input
              className="rounded-lg"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
            />
          </TextField>
          {selectedTimeConflict && (
            <div
              className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-xs font-bold text-danger"
              role="alert"
            >
              This selected time overlaps an existing pending or approved
              booking. Choose another slot.
            </div>
          )}
          {startTime && endTime && !selectedTimeConflict && (
            <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs font-bold text-success">
              Selected slot is currently available:{" "}
              {formatTimeRange(startTime, endTime)}.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
