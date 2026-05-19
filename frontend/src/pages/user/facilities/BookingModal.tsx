import type { Facility } from "./types";

import { useEffect, useState } from "react";
import { Modal, Button, useOverlayState } from "@heroui/react";
import { Calendar, Info, CheckCircle2 } from "lucide-react";

import { getLocalDateValue, ACTIVE_BOOKING_STATUSES } from "./helpers";
import { useFacilityBookings } from "./use-facility-bookings";
import { BookingFields } from "./BookingFields";
import { FacilityFields } from "./FacilityFields";

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

  const hasTimeConflict =
    !(isEditMode || isCreateMode) &&
    !!startTime &&
    !!endTime &&
    facilityBookings.some(
      (booking: any) =>
        new Date(booking.startTime) < new Date(endTime) &&
        new Date(booking.endTime) > new Date(startTime) &&
        ACTIVE_BOOKING_STATUSES.has(booking.status),
    );

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
        localStorage.setItem("booking_refresh_ts", Date.now().toString());
        window.dispatchEvent(new CustomEvent("bookings:refresh"));
        resetForm();
        onClose();
        onSuccess();
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

                  {isEditMode || isCreateMode ? (
                    <FacilityFields
                      capacity={capacity}
                      description={purpose}
                      name={name}
                      onCapacityChange={setCapacity}
                      onDescriptionChange={setPurpose}
                      onFileSelect={setSelectedFile}
                      onNameChange={setName}
                    />
                  ) : (
                    <BookingFields
                      bookingDate={bookingDate}
                      endTime={endTime}
                      facilityBookings={facilityBookings}
                      facilityBookingsLoading={facilityBookingsLoading}
                      isRecurring={isRecurring}
                      purpose={purpose}
                      recurrenceCount={recurrenceCount}
                      recurrenceType={recurrenceType}
                      startTime={startTime}
                      onBookingDateChange={setBookingDate}
                      onEndTimeChange={setEndTime}
                      onPurposeChange={setPurpose}
                      onRecurrenceCountChange={setRecurrenceCount}
                      onRecurrenceTypeChange={setRecurrenceType}
                      onRecurringChange={setIsRecurring}
                      onStartTimeChange={setStartTime}
                    />
                  )}
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
                    isDisabled={hasTimeConflict}
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
