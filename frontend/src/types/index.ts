export type Role = "ADMIN" | "USER";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  capacity: number;
  image?: string;
}

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface Booking {
  id: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userId: string;
  facilityId: string;
  user?: User;
  facility?: Facility;
  recurrenceGroupId?: string;
  paymentStatus?: PaymentStatus;
  depositAmount?: string;
  createdAt?: string;
}
