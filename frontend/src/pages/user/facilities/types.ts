export interface Facility {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface BookingData {
  id: string;
  facilityId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  facility?: { id: string; name: string };
  isRecurring?: boolean;
  recurrenceType?: string;
  recurrenceCount?: number;
}
