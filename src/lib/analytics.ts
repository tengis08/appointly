export type AnalyticsPeriod = "30" | "90" | "365" | "ytd" | "custom" | "all";
export type AnalyticsGroup = "day" | "week" | "month";
export type AnalyticsSort = "revenue" | "bookings" | "name";

export function normalizeAnalyticsPeriod(
  period: string | null | undefined
): AnalyticsPeriod {
  if (
    period === "30" ||
    period === "90" ||
    period === "365" ||
    period === "ytd" ||
    period === "custom" ||
    period === "all"
  ) {
    return period;
  }

  return "30";
}

export function normalizeAnalyticsGroup(
  group: string | null | undefined
): AnalyticsGroup {
  if (group === "week" || group === "month") return group;
  return "day";
}

export function normalizeAnalyticsSort(
  sort: string | null | undefined
): AnalyticsSort {
  if (sort === "bookings" || sort === "name") return sort;
  return "revenue";
}

export function normalizeDateInput(value: string | null | undefined) {
  const text = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  return "";
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAnalyticsDateRange(params: {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  now?: Date;
}) {
  const now = params.now || new Date();

  if (params.period === "all") {
    return { startDate: "", endDate: "" };
  }

  if (params.period === "custom") {
    return {
      startDate: normalizeDateInput(params.startDate),
      endDate: normalizeDateInput(params.endDate),
    };
  }

  if (params.period === "ytd") {
    const start = new Date(now.getFullYear(), 0, 1);

    return {
      startDate: formatDateKey(start),
      endDate: "",
    };
  }

  const days = Number(params.period);
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  return {
    startDate: formatDateKey(start),
    endDate: "",
  };
}

export function dateFromString(dateString: string) {
  return new Date(`${dateString}T12:00:00`);
}

export function getWeekKey(dateString: string) {
  const date = dateFromString(dateString);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return `Week of ${formatDateKey(date)}`;
}

export function getMonthKey(dateString: string) {
  return dateString.slice(0, 7);
}

export function getGroupKey(dateString: string, group: AnalyticsGroup) {
  if (group === "month") return getMonthKey(dateString);
  if (group === "week") return getWeekKey(dateString);
  return dateString;
}

export function toPriceNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
