import { LOCALE } from "@/config/locale";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: string | Date) => {
  return `${formatDate(date)} pada ${formatTime(date)}`;
};
