const PUBLIC_FACILITY_IMAGES: Record<string, string> = {
  "collaboration zone b": "/Collaboration_Zone_B.png",
  "creative design studio": "/Creative_Design_Studio.png",
  "executive meeting room": "/Executive_Meeting_Room.png",
  "grand auditorium": "/Grand_Auditorium.png",
  "professional podcast room": "/Professional_Podcast_Room.png",
};

export function getPublicFacilityImage(name?: string) {
  return name ? PUBLIC_FACILITY_IMAGES[name.toLowerCase()] : undefined;
}

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    "/api/v1",
    "",
  );
}

export function getFacilityImageSrc(facility: any) {
  const imageUrl = facility.imageUrl || getPublicFacilityImage(facility.name);

  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  if (imageUrl.startsWith("/uploads/")) return `${getApiBaseUrl()}${imageUrl}`;
  if (imageUrl.startsWith("/")) return imageUrl;

  return `/${imageUrl}`;
}

export const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "APPROVED"]);

function padTime(value: number) {
  return value.toString().padStart(2, "0");
}

export function getLocalDateValue(date = new Date()) {
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}`;
}

export function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function isOverlappingSlot(
  booking: any,
  slotStart: Date,
  slotEnd: Date,
) {
  if (!ACTIVE_BOOKING_STATUSES.has(booking.status)) return false;

  const bookingStart = new Date(booking.startTime);
  const bookingEnd = new Date(booking.endTime);

  return bookingStart < slotEnd && bookingEnd > slotStart;
}

export function getDateRange(dateKey: string) {
  const dayStart = new Date(`${dateKey}T00:00`);
  const dayEnd = new Date(`${dateKey}T23:59:59.999`);

  return { dayStart, dayEnd };
}
