import type { Facility } from "./types";

import { useEffect, useState, useRef, useCallback } from "react";

import api from "@/config/api";

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setIsAdmin(res.data?.data?.role === "ADMIN"))
      .catch(() => {});
  }, []);

  const fetchFacilities = useCallback(
    async (includeInactive = false) => {
      setLoading(true);
      setFetchError("");
      try {
        const endpoint =
          includeInactive && isAdmin ? "/facilities/admin/all" : "/facilities";
        const response = await api.get(endpoint);
        const data = response.data.data?.items || response.data.data || [];

        setFacilities(Array.isArray(data) ? data : []);
      } catch {
        setFetchError("Gagal memuat data fasilitas. Silakan coba lagi.");
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin],
  );

  useEffect(() => {
    fetchFacilities(showInactive);
  }, [showInactive, fetchFacilities]);

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    facilities: filteredFacilities,
    loading,
    fetchError,
    isAdmin,
    showInactive,
    setShowInactive,
    searchQuery,
    setSearchQuery,
    fetchFacilities,
    mountedRef,
  };
}
