// ============================================================
// FILE: utils/dateUtils.ts
// Helper format tanggal/waktu — menggunakan locale Indonesia (id-ID)
// formatDate: "Senin, 13 Mei 2026"
// formatTime: "14:30"
// formatDateTime: "Senin, 13 Mei 2026 pada 14:30"
// ============================================================

import { LOCALE } from "@/config/locale";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString(LOCALE, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
};

export const formatDateTime = (date: string | Date) => `${formatDate(date)} pada ${formatTime(date)}`;
