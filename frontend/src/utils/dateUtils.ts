import { LOCALE } from "@/config/locale";

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: string | Date) => {
  return `${formatDate(date)} pada ${formatTime(date)}`;
};

export const isLive = (start: string | Date, end: string | Date) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  return now >= startDate && now <= endDate;
};
