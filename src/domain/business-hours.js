import { STORE_HOURS } from "../config/store.js";

const storeTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: STORE_HOURS.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function checkRestaurantOpen(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("Informe um objeto Date válido.");
  }

  const parts = storeTimeFormatter.formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour").value);

  const minute = Number(parts.find((part) => part.type === "minute").value);

  const currentMinutes = hour * 60 + minute;

  return (
    currentMinutes >= STORE_HOURS.openingMinutes &&
    currentMinutes < STORE_HOURS.closingMinutes
  );
}
