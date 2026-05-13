import type { BookingData } from "./types";

import { useState } from "react";

import api from "@/config/api";
import { extractCollection } from "@/utils/apiData";

export function useFacilityBookings() {
  const [facilityBookings, setFacilityBookings] = useState<BookingData[]>([]);
  const [facilityBookingsLoading, setFacilityBookingsLoading] = useState(false);

  const fetchFacilityBookings = async (facilityId: string) => {
    setFacilityBookingsLoading(true);
    try {
      const response = await api.get(`/bookings/facility/${facilityId}`);

      setFacilityBookings(extractCollection(response.data.data));
    } catch {
      setFacilityBookings([]);
    } finally {
      setFacilityBookingsLoading(false);
    }
  };

  return {
    facilityBookings,
    facilityBookingsLoading,
    fetchFacilityBookings,
    setFacilityBookings,
  };
}
