import { STORE_HOURS } from "../config/store.js";
import { checkRestaurantOpen } from "../domain/business-hours.js";

function formatScheduleTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return minute === 0
    ? `${hour}h`
    : `${hour}h${String(minute).padStart(2, "0")}`;
}

export function startStoreStatus({
  badge,
  hoursLabel,
  statusLabel,
  now = () => new Date(),
}) {
  if (!badge || !hoursLabel || !statusLabel) {
    throw new Error(
      "Confira os elementos date-span, store-hours e store-status no HTML.",
    );
  }

  const opening = formatScheduleTime(STORE_HOURS.openingMinutes);
  const closing = formatScheduleTime(STORE_HOURS.closingMinutes);

  hoursLabel.textContent = `Seg. a Dom. — ${opening} às ${closing}`;

  function refresh() {
    const isOpen = checkRestaurantOpen(now());
    const message = isOpen ? "Aberto agora" : "Fechado agora";

    badge.classList.remove("bg-gray-700");
    badge.classList.toggle("bg-green-700", isOpen);
    badge.classList.toggle("bg-red-700", !isOpen);

    if (statusLabel.textContent !== message) {
      statusLabel.textContent = message;
    }
  }

  function refreshWhenVisible() {
    if (document.visibilityState === "visible") {
      refresh();
    }
  }

  refresh();

  const intervalId = window.setInterval(refreshWhenVisible, 15_000);

  document.addEventListener("visibilitychange", refreshWhenVisible);

  window.addEventListener("pageshow", refreshWhenVisible);

  return function stopStoreStatus() {
    window.clearInterval(intervalId);

    document.removeEventListener("visibilitychange", refreshWhenVisible);

    window.removeEventListener("pageshow", refreshWhenVisible);
  };
}
