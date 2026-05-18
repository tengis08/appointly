import type { Locale } from "@/lib/translations";

export const defaultTimeZone = "America/New_York";

export type TimeZoneOption = {
  value: string;
  label: string;
};

export const masterTimeZones: TimeZoneOption[] = [
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu" },
  { value: "America/Anchorage", label: "Alaska — Anchorage" },
  { value: "America/Los_Angeles", label: "US Pacific — Los Angeles" },
  { value: "America/Denver", label: "US Mountain — Denver" },
  { value: "America/Chicago", label: "US Central — Chicago" },
  { value: "America/New_York", label: "US Eastern — New York" },
  { value: "America/Toronto", label: "Canada Eastern — Toronto" },
  { value: "America/Vancouver", label: "Canada Pacific — Vancouver" },
  { value: "America/Mexico_City", label: "Mexico — Mexico City" },
  { value: "America/Bogota", label: "Colombia — Bogotá" },
  { value: "America/Lima", label: "Peru — Lima" },
  { value: "America/Santiago", label: "Chile — Santiago" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina — Buenos Aires" },
  { value: "America/Sao_Paulo", label: "Brazil — São Paulo" },
  { value: "Europe/London", label: "UK — London" },
  { value: "Europe/Madrid", label: "Spain — Madrid" },
  { value: "Europe/Paris", label: "France — Paris" },
  { value: "Europe/Berlin", label: "Germany — Berlin" },
  { value: "Europe/Rome", label: "Italy — Rome" },
  { value: "Europe/Warsaw", label: "Poland — Warsaw" },
  { value: "Europe/Istanbul", label: "Turkey — Istanbul" },
  { value: "Europe/Moscow", label: "Russia — Moscow" },
  { value: "Asia/Tbilisi", label: "Georgia — Tbilisi" },
  { value: "Asia/Yerevan", label: "Armenia — Yerevan" },
  { value: "Asia/Dubai", label: "UAE — Dubai" },
  { value: "Asia/Almaty", label: "Kazakhstan — Almaty" },
  { value: "Asia/Tashkent", label: "Uzbekistan — Tashkent" },
  { value: "Asia/Kolkata", label: "India — Kolkata" },
  { value: "Asia/Bangkok", label: "Thailand — Bangkok" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "China — Shanghai" },
  { value: "Asia/Tokyo", label: "Japan — Tokyo" },
  { value: "Asia/Seoul", label: "South Korea — Seoul" },
  { value: "Australia/Sydney", label: "Australia — Sydney" },
  { value: "Pacific/Auckland", label: "New Zealand — Auckland" },
  { value: "Africa/Johannesburg", label: "South Africa — Johannesburg" },
];

const timeZoneValues = new Set(masterTimeZones.map((timeZone) => timeZone.value));

export function normalizeTimeZone(value: string | null | undefined) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return defaultTimeZone;
  }

  if (timeZoneValues.has(trimmed)) {
    return trimmed;
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(new Date());
    return trimmed;
  } catch {
    return defaultTimeZone;
  }
}

export function getTimeZoneLabel(timeZone: string | null | undefined) {
  const normalized = normalizeTimeZone(timeZone);
  const found = masterTimeZones.find((item) => item.value === normalized);
  return found?.label || normalized;
}

export const timeZoneText = {
  en: {
    timeZone: "Time zone",
    timeZoneHelp: "Clients see available times in this time zone.",
    timeZoneShort: "Time zone",
    timesShownIn: "Times are shown in the master's time zone",
  },
  es: {
    timeZone: "Zona horaria",
    timeZoneHelp: "Los clientes ven los horarios disponibles en esta zona horaria.",
    timeZoneShort: "Zona horaria",
    timesShownIn: "Los horarios se muestran en la zona horaria del especialista",
  },
  ru: {
    timeZone: "Часовой пояс",
    timeZoneHelp: "Клиенты видят доступное время в этом часовом поясе.",
    timeZoneShort: "Часовой пояс",
    timesShownIn: "Время показано в часовом поясе специалиста",
  },
} satisfies Record<Locale, Record<string, string>>;

export function getDateStringInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDayOfWeekFromDateString(dateString: string) {
  return new Date(`${dateString}T12:00:00Z`).getUTCDay();
}

export function getCurrentMinutesInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return hour * 60 + minute;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = new Map(parts.map((part) => [part.type, part.value]));

  const asUtc = Date.UTC(
    Number(values.get("year")),
    Number(values.get("month")) - 1,
    Number(values.get("day")),
    Number(values.get("hour")),
    Number(values.get("minute")),
    Number(values.get("second"))
  );

  return asUtc - date.getTime();
}

export function zonedDateTimeToUtcDate(
  dateString: string,
  timeString: string,
  timeZone: string
) {
  const normalizedTime = timeString.trim().slice(0, 5);
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = normalizedTime.split(":").map(Number);

  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let index = 0; index < 3; index += 1) {
    const offset = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
    utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offset;
  }

  return new Date(utcMs);
}
