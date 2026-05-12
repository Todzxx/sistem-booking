import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  TextField,
  Label,
  InputGroup,
  FieldError,
  Chip,
  Checkbox,
  Select,
  ListBox,
  TextArea,
  useOverlayState,
} from "@heroui/react";
import {
  Search,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react";

import api from "@/config/api";

const PUBLIC_FACILITY_IMAGES: Record<string, string> = {
  "collaboration zone b": "/Collaboration_Zone_B.png",
  "creative design studio": "/Creative_Design_Studio.png",
  "executive meeting room": "/Executive_Meeting_Room.png",
  "grand auditorium": "/Grand_Auditorium.png",
  "professional podcast room": "/Professional_Podcast_Room.png",
};

function getPublicFacilityImage(name?: string) {
  return name ? PUBLIC_FACILITY_IMAGES[name.toLowerCase()] : undefined;
}

function getFacilityImageSrc(facility: any) {
  const imageUrl = facility.imageUrl || getPublicFacilityImage(facility.name);

  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads/")) {
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${imageUrl}`;
  }
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "APPROVED"]);

function padTime(value: number) {
  return value.toString().padStart(2, "0");
}

function getLocalDateValue(date = new Date()) {
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}`;
}

function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function isOverlappingSlot(booking: any, slotStart: Date, slotEnd: Date) {
  if (!ACTIVE_BOOKING_STATUSES.has(booking.status)) return false;

  const bookingStart = new Date(booking.startTime);
  const bookingEnd = new Date(booking.endTime);

  return bookingStart < slotEnd && bookingEnd > slotStart;
}

function getDateRange(dateKey: string) {
  const dayStart = new Date(`${dateKey}T00:00`);
  const dayEnd = new Date(`${dateKey}T23:59:59.999`);

  return { dayStart, dayEnd };
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use simple React state for Modal
  const [isOpen, setIsOpen] = useState(false);
  const modalState = useOverlayState({ isOpen, onOpenChange: setIsOpen });
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  // Booking form state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<string>("WEEKLY");
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [name, setName] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState(getLocalDateValue());
  const [facilityBookings, setFacilityBookings] = useState<any[]>([]);
  const [facilityBookingsLoading, setFacilityBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [capacity, setCapacity] = useState(1);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setIsAdmin(res.data.data.role === "ADMIN"))
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchFacilities = async (includeInactive = false) => {
    setLoading(true);
    try {
      const endpoint = includeInactive && isAdmin ? "/facilities/admin/all" : "/facilities";
      const response = await api.get(endpoint);
      const data = response.data.data?.items || response.data.data || [];

      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching facilities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities(showInactive);
  }, [showInactive]);

  const fetchFacilityBookings = async (facilityId: string) => {
    setFacilityBookingsLoading(true);
    try {
      const response = await api.get(`/bookings/facility/${facilityId}`);

      setFacilityBookings(response.data.data?.items || response.data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching facility bookings", err);
      setFacilityBookings([]);
    } finally {
      setFacilityBookingsLoading(false);
    }
  };

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
    setIsEditMode(false);
    setIsCreateMode(false);
  };

  const handleOpenBooking = (facility: any) => {
    setSelectedFacility(facility);
    resetForm();
    setIsOpen(true);
    fetchFacilityBookings(facility.id);
  };

  const selectedTimeConflict =
    !!startTime &&
    !!endTime &&
    facilityBookings.some((booking) =>
      isOverlappingSlot(booking, new Date(startTime), new Date(endTime)),
    );

  const { dayStart, dayEnd } = getDateRange(bookingDate);
  const occupiedBookingsForSelectedDate = facilityBookings
    .filter(
      (booking) =>
        ACTIVE_BOOKING_STATUSES.has(booking.status) &&
        isOverlappingSlot(booking, dayStart, dayEnd),
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
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
          await api.patch(`/facilities/${selectedFacility.id}`, formData, {
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
          resetForm();
          setIsOpen(false);
          fetchFacilities();
        }, 1000);
      } else {
        const availability = await api.get("/bookings/check", {
          params: {
            facilityId: selectedFacility.id,
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
          facilityId: selectedFacility.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose: purpose,
          isRecurring,
          ...(isRecurring && { recurrenceType, recurrenceCount }),
        });
        setSuccess("Booking submitted and waiting for admin approval.");
        fetchFacilityBookings(selectedFacility.id);
        setTimeout(() => {
          resetForm();
          setIsOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Facilities
          </h1>
          <p className="text-muted font-medium text-lg">
            Browse and book premium spaces for your team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {isAdmin && (
            <>
              <Button
                className="font-black rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 whitespace-nowrap"
                variant="primary"
                onPress={() => {
                  setIsCreateMode(true);
                  setIsEditMode(false);
                  setName("");
                  setPurpose("");
                  setCapacity(1);
                  setSelectedFile(null);
                  setIsOpen(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Add New Facility
              </Button>
              <Button
                className={`font-black rounded-2xl h-12 px-6 whitespace-nowrap ${showInactive ? "bg-warning text-white border-warning" : "border-default-200"}`}
                variant={showInactive ? "primary" : "ghost"}
                onPress={() => setShowInactive((prev) => !prev)}
              >
                {showInactive ? "Showing All" : "Show Inactive"}
              </Button>
            </>
          )}
          <div className="relative w-full md:w-80">
            <InputGroup
              aria-label="Search facilities"
              className="rounded-2xl border-default-200"
            >
              <InputGroup.Prefix className="pl-3">
                <Search className="text-default-400" size={18} />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 bg-default-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredFacilities.length === 0 ? (
        <Card className="p-20 flex flex-col items-center justify-center text-center bg-default-50/50 border-dashed border-2 border-default-200 rounded-xl">
          <MapPin className="text-default-300 mb-4" size={48} />
          <p className="text-muted text-lg font-bold">No facilities found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFacilities.map((facility) => (
            <Card
              key={facility.id}
              className={`group overflow-hidden rounded-xl transition-all duration-500 border bg-background/60 backdrop-blur-md ${
                facility.isActive
                  ? "hover:shadow-2xl hover:shadow-primary/10 border-default-200"
                  : "opacity-70 border-danger/20"
              }`}
            >
              <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                {getFacilityImageSrc(facility) ? (
                  <img
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={getFacilityImageSrc(facility)}
                    onError={(event) => {
                      const fallback = getPublicFacilityImage(facility.name);

                      if (fallback && !event.currentTarget.dataset.fallback) {
                        event.currentTarget.dataset.fallback = "true";
                        event.currentTarget.src = fallback;
                      }
                    }}
                  />
                ) : (
                  <div className="group-hover:scale-110 transition-transform duration-700">
                    <svg
                      className="text-primary/30"
                      fill="none"
                      height="80"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="0.5"
                      viewBox="0 0 24 24"
                      width="80"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                )}
                <Chip
                  className="absolute top-4 right-4 capitalize font-black px-3"
                  color={facility.isActive ? "success" : "danger"}
                  variant="soft"
                >
                  {facility.isActive ? "Available" : "Maintenance"}
                </Chip>
              </div>
              <Card.Header className="flex flex-col items-start px-7 pt-7">
                <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                  {facility.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-default-100 text-default-600 text-xs font-bold border border-default-200">
                    <Users size={12} />
                    {facility.capacity} People
                  </div>
                </div>
              </Card.Header>
              <Card.Content className="px-7 py-5">
                <p className="text-muted text-sm leading-relaxed font-medium">
                  {facility.description ||
                    "Premium collaborative environment designed to maximize your team's innovative potential and workflow."}
                </p>
              </Card.Content>
              <Card.Footer className="px-7 pb-7 pt-2 flex flex-col gap-3">
                <Button
                  className="w-full h-14 text-base font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                  isDisabled={!facility.isActive}
                  variant="primary"
                  onPress={() => handleOpenBooking(facility)}
                >
                  Book Space
                  <ArrowRight
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                </Button>
                {isAdmin && facility.isActive && (
                  <Button
                    className="w-full h-10 text-xs font-bold rounded-xl border-default-200"
                    variant="ghost"
                    onPress={() => {
                      setSelectedFacility(facility);
                      setName(facility.name);
                      setPurpose(facility.description || "");
                      setCapacity(facility.capacity || 1);
                      setIsOpen(true);
                      setIsEditMode(true);
                      setIsCreateMode(false);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Admin: Edit Facility
                  </Button>
                )}
                {isAdmin && !facility.isActive && (
                  <Button
                    className="w-full h-10 text-xs font-bold rounded-xl border-success/30 bg-success/10 text-success"
                    variant="ghost"
                    onPress={async () => {
                      try {
                        await api.patch(`/facilities/${facility.id}/reactivate`);
                        fetchFacilities(showInactive);
                      } catch (err) {
                        console.error("Failed to reactivate facility", err);
                      }
                    }}
                  >
                    Reactivate Facility
                  </Button>
                )}
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

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
                    <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Calendar size={32} />
                    </div>
                    <Modal.Heading className="text-3xl font-black tracking-tight">
                      {isCreateMode
                        ? "New Facility"
                        : isEditMode
                          ? "Edit Facility"
                          : "Reserve Space"}
                    </Modal.Heading>
                    <p className="text-muted font-medium">
                      {isCreateMode
                        ? "Create a new premium space"
                        : isEditMode
                          ? `Updating ${selectedFacility?.name}`
                          : `You are booking ${selectedFacility?.name}`}
                    </p>
                  </Modal.Header>
                  <Modal.Body className="flex flex-col gap-6 py-8">
                    {error && (
                      <div className="bg-danger/10 text-danger text-sm p-4 rounded-2xl border border-danger/20 flex items-center gap-3 font-bold animate-shake">
                        <Info size={18} />
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="bg-success/10 text-success text-sm p-4 rounded-2xl border border-success/20 flex items-center gap-3 font-bold">
                        <CheckCircle2 size={18} />
                        {success}
                      </div>
                    )}

                    {!(isEditMode || isCreateMode) && (
                      <div className="space-y-3 rounded-xl border border-default-200 bg-default-50/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-default-700">
                              Slot Availability
                            </p>
                            <p className="text-[11px] font-bold text-default-400">
                              Booked times for the selected date.
                            </p>
                          </div>
                          <Clock className="text-primary shrink-0" size={18} />
                        </div>

                        <TextField
                          aria-label="Booking date"
                          name="bookingDate"
                          type="date"
                        >
                          <InputGroup.Input
                            className="rounded-2xl"
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
                                className="h-12 rounded-2xl bg-default-100 animate-pulse"
                              />
                            ))}
                          </div>
                        ) : (
                          <>
                            {occupiedBookingsForSelectedDate.length === 0 ? (
                              <div className="rounded-2xl border border-success/20 bg-success/10 p-3 text-xs font-bold text-success">
                                No pending or approved bookings for this date.
                              </div>
                            ) : (
                              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                                {occupiedBookingsForSelectedDate.map(
                                  (booking) => (
                                    <div
                                      key={booking.id}
                                      className="flex items-center justify-between gap-3 rounded-2xl border border-danger/20 bg-danger/10 px-3 py-2 text-danger"
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
                          </>
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
                            className="rounded-2xl"
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
                          className="rounded-2xl w-full text-left"
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
                        <div className="flex flex-col gap-4 p-4 bg-default-50 rounded-2xl border border-default-100">
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
                            <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
                              <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase text-default-400 ml-1">
                                  Type
                                </Label>
                                <Select
                                  aria-label="Recurrence type"
                                  className="rounded-xl"
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
                                      <ListBox.Item
                                        id="DAILY"
                                        textValue="Daily"
                                      >
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
                                    className="rounded-xl"
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
                              className="rounded-2xl"
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
                              className="text-xs text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
                              className="rounded-2xl"
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
                              className="rounded-2xl"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                            />
                            <FieldError />
                          </TextField>
                          {selectedTimeConflict && (
                            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-bold text-danger">
                              This selected time overlaps an existing pending or
                              approved booking. Choose another slot.
                            </div>
                          )}
                          {startTime && endTime && !selectedTimeConflict && (
                            <div className="rounded-2xl border border-success/20 bg-success/10 p-3 text-xs font-bold text-success">
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
                      className="flex-1 h-14 rounded-2xl font-bold border-default-200"
                      variant="ghost"
                      onPress={() => {
                        resetForm();
                        close();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-2xl font-bold shadow-xl shadow-primary/30"
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
    </div>
  );
}
