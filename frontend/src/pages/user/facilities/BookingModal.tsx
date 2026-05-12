import type { Facility, BookingData } from "./types";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Label,
  InputGroup,
  FieldError,
  Checkbox,
  Select,
  ListBox,
  TextArea,
  useOverlayState,
} from "@heroui/react";
import { Calendar, Info, CheckCircle2, Clock } from "lucide-react";

import {
  getLocalDateValue,
  formatTimeRange,
  isOverlappingSlot,
  getDateRange,
  ACTIVE_BOOKING_STATUSES,
} from "./helpers";
import { useFacilityBookings } from "./use-facility-bookings";

import api from "@/config/api";

type ModalMode = "booking" | "edit" | "create";

interface BookingModalProps {
  facility: Facility | null;
  isOpen: boolean;
  mode: ModalMode;
  onClose: () => void;
  onSuccess: () => void;
  mountedRef: React.MutableRefObject<boolean>;
}

export default function BookingModal({
  facility,
  isOpen,
  mode,
  onClose,
  onSuccess,
  mountedRef,
}: BookingModalProps) {
  const {
    facilityBookings,
    facilityBookingsLoading,
    fetchFacilityBookings,
    setFacilityBookings,
  } = useFacilityBookings();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("WEEKLY");
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [bookingDate, setBookingDate] = useState(getLocalDateValue());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const resetForm = () => {
    setStartTime("");
    setEndTime("");
    setBookingDate(getLocalDateValue());
    setFacilityBookings([]);
    setPurpose("");
    setIsRecurring(false);
    setRecurrenceType("WEEKLY");
    setRecurrenceCount(1);
    setName("");
    setCapacity(1);
    setSelectedFile(null);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (facility && isOpen) {
      resetForm();
      fetchFacilityBookings(facility.id);
    }
  }, [facility?.id, isOpen]);

  const selectedTimeConflict = useMemo(
    () =>
      !!startTime &&
      !!endTime &&
      facilityBookings.some((booking: BookingData) =>
        isOverlappingSlot(booking, new Date(startTime), new Date(endTime)),
      ),
    [startTime, endTime, facilityBookings],
  );

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

  const handleBookingSubmit = async () => {
    if (isEditMode || isCreateMode) {
      if (!name) {
        setError("Name is required");

        return;
      }
    } else {
      if (!startTime || !endTime || !purpose) {
        setError("All fields are required");

        return;
      }

      if (new Date(startTime) <= new Date()) {
        setError("Start time must be greater than now");

        return;
      }

      if (new Date(endTime) <= new Date(startTime)) {
        setError("End time must be greater than start time");

        return;
      }
    }

    setError("");
    setBookingLoading(true);

    try {
      if (isEditMode || isCreateMode) {
        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", purpose);
        formData.append("capacity", capacity.toString());
        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        if (isEditMode) {
          await api.patch(`/facilities/${facility!.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setSuccess("Facility updated successfully!");
        } else {
          await api.post("/facilities", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setSuccess("Facility created successfully!");
        }

        setTimeout(() => {
          if (!mountedRef.current) return;
          resetForm();
          onClose();
          onSuccess();
        }, 1000);
      } else {
        const availability = await api.get("/bookings/check", {
          params: {
            facilityId: facility!.id,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
          },
        });

        if (!availability.data.data?.isAvailable) {
          setError(
            "This room is already booked or pending for the selected time slot.",
          );
          setBookingLoading(false);

          return;
        }

        await api.post("/bookings", {
          facilityId: facility!.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose,
          isRecurring,
          ...(isRecurring && { recurrenceType, recurrenceCount }),
        });
        setSuccess("Booking submitted and waiting for admin approval.");
        fetchFacilityBookings(facility!.id);
        setTimeout(() => {
          if (!mountedRef.current) return;
          resetForm();
          onClose();
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const modalState = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    },
  });

  return (
    <Modal state={modalState}>
      <Modal.Trigger>
        <button aria-hidden className="sr-only" tabIndex={-1} />
      </Modal.Trigger>
      <Modal.Backdrop variant="blur">
        <Modal.Container scroll="inside">
          <Modal.Dialog className="max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden rounded-xl border border-default-200 bg-surface/90 backdrop-blur-xl p-2">
            {({ close }) => (
              <div className="p-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
                <Modal.Header className="flex flex-col gap-1 items-center text-center px-4 pt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Calendar size={28} />
                  </div>
                  <Modal.Heading className="text-2xl font-black tracking-tight">
                    {isCreateMode
                      ? "New Facility"
                      : isEditMode
                        ? "Edit Facility"
                        : "Reserve Space"}
                  </Modal.Heading>
                  <p className="text-default-500 text-sm font-medium">
                    {isCreateMode
                      ? "Create a new premium space"
                      : isEditMode
                        ? `Updating ${facility?.name}`
                        : `You are booking ${facility?.name}`}
                  </p>
                </Modal.Header>

                <Modal.Body className="flex flex-col gap-5 py-6">
                  {error && (
                    <div
                      className="bg-danger/10 text-danger text-sm p-3 rounded-lg border border-danger/20 flex items-center gap-2 font-bold"
                      role="alert"
                    >
                      <Info size={16} />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      className="bg-success/10 text-success text-sm p-3 rounded-lg border border-success/20 flex items-center gap-2 font-bold"
                      role="status"
                    >
                      <CheckCircle2 size={16} />
                      {success}
                    </div>
                  )}

                  {!(isEditMode || isCreateMode) && (
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

                      <TextField
                        aria-label="Booking date"
                        name="bookingDate"
                        type="date"
                      >
                        <InputGroup.Input
                          className="rounded-lg"
                          value={bookingDate}
                          onChange={(e) => {
                            setBookingDate(e.target.value);
                            setStartTime("");
                            setEndTime("");
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
                          {occupiedBookingsForSelectedDate.map(
                            (booking: BookingData) => (
                              <div
                                key={booking.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-danger"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-black">
                                    {formatTimeRange(
                                      booking.startTime,
                                      booking.endTime,
                                    )}
                                  </p>
                                  <p className="truncate text-[10px] font-bold opacity-80">
                                    {booking.purpose || "Booked"}
                                  </p>
                                </div>
                                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest">
                                  {booking.status}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {(isEditMode || isCreateMode) && (
                      <TextField isRequired name="name" type="text">
                        <Label className="text-sm font-black text-default-700 ml-1">
                          Facility Name
                        </Label>
                        <InputGroup.Input
                          className="rounded-lg"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </TextField>
                    )}

                    <div className="space-y-4">
                      <label className="text-sm font-black text-default-700 ml-1">
                        {isEditMode || isCreateMode
                          ? "Description"
                          : "Event Purpose"}
                      </label>
                      <TextArea
                        aria-label={
                          isEditMode || isCreateMode
                            ? "Room description"
                            : "Event purpose"
                        }
                        className="rounded-lg w-full text-left"
                        placeholder={
                          isEditMode || isCreateMode
                            ? "Room description..."
                            : "What's the occasion?"
                        }
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      />
                    </div>

                    {!(isEditMode || isCreateMode) && (
                      <div className="flex flex-col gap-4 p-4 bg-default-50 rounded-lg border border-default-100">
                        <Checkbox
                          isSelected={isRecurring}
                          onChange={setIsRecurring}
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <Label className="text-sm font-bold">
                              Recurring Booking
                            </Label>
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
                                onChange={(key) =>
                                  setRecurrenceType(key as string)
                                }
                              >
                                <Select.Trigger className="w-full">
                                  <Select.Value />
                                </Select.Trigger>
                                <Select.Popover>
                                  <ListBox>
                                    <ListBox.Item id="DAILY" textValue="Daily">
                                      Daily
                                    </ListBox.Item>
                                    <ListBox.Item
                                      id="WEEKLY"
                                      textValue="Weekly"
                                    >
                                      Weekly
                                    </ListBox.Item>
                                    <ListBox.Item
                                      id="MONTHLY"
                                      textValue="Monthly"
                                    >
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
                                    setRecurrenceCount(
                                      Math.min(
                                        12,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                />
                              </TextField>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isEditMode || isCreateMode ? (
                      <div className="flex flex-col gap-6">
                        <TextField isRequired name="capacity" type="number">
                          <Label className="text-sm font-black text-default-700 ml-1">
                            Capacity (People)
                          </Label>
                          <InputGroup.Input
                            className="rounded-lg"
                            min={1}
                            type="number"
                            value={capacity.toString()}
                            onChange={(e) =>
                              setCapacity(parseInt(e.target.value) || 1)
                            }
                          />
                        </TextField>

                        <div className="flex flex-col gap-2">
                          <label
                            className="text-sm font-black text-default-700 ml-1"
                            htmlFor="facility-image"
                          >
                            Facility Image
                          </label>
                          <input
                            accept="image/*"
                            aria-label="Facility image upload"
                            className="text-xs text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            id="facility-image"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;

                              if (file && file.size > 5 * 1024 * 1024) {
                                alert("File too large. Maximum size is 5MB.");
                                e.target.value = "";

                                return;
                              }
                              if (file && !file.type.startsWith("image/")) {
                                alert("Only image files are allowed.");
                                e.target.value = "";

                                return;
                              }
                              setSelectedFile(file);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <TextField
                          isRequired
                          name="startTime"
                          type="datetime-local"
                        >
                          <Label className="text-sm font-black text-default-700 ml-1">
                            Start Time
                          </Label>
                          <InputGroup.Input
                            className="rounded-lg"
                            value={startTime}
                            onChange={(e) => {
                              setStartTime(e.target.value);
                              if (e.target.value) {
                                setBookingDate(e.target.value.slice(0, 10));
                              }
                            }}
                          />
                          <FieldError />
                        </TextField>
                        <TextField
                          isRequired
                          name="endTime"
                          type="datetime-local"
                        >
                          <Label className="text-sm font-black text-default-700 ml-1">
                            End Time
                          </Label>
                          <InputGroup.Input
                            className="rounded-lg"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                          <FieldError />
                        </TextField>
                        {selectedTimeConflict && (
                          <div
                            className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-xs font-bold text-danger"
                            role="alert"
                          >
                            This selected time overlaps an existing pending or
                            approved booking. Choose another slot.
                          </div>
                        )}
                        {startTime && endTime && !selectedTimeConflict && (
                          <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs font-bold text-success">
                            Selected slot is currently available:{" "}
                            {formatTimeRange(startTime, endTime)}.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer className="px-0 pb-2 gap-3 flex flex-col sm:flex-row">
                  <Button
                    className="flex-1 h-12 rounded-lg font-bold border-default-200"
                    variant="ghost"
                    onPress={() => {
                      resetForm();
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-12 rounded-lg font-bold"
                    isDisabled={selectedTimeConflict}
                    isPending={bookingLoading}
                    variant="primary"
                    onPress={handleBookingSubmit}
                  >
                    {isCreateMode
                      ? "Create Facility"
                      : isEditMode
                        ? "Update Facility"
                        : "Confirm Booking"}
                  </Button>
                </Modal.Footer>
              </div>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
