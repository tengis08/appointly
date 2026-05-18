"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import {
  getGroupKey,
  toMoney,
  toPriceNumber,
  type AnalyticsGroup,
  type AnalyticsPeriod,
} from "@/lib/analytics";

type AnalyticsAppointment = {
  id: number | string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
  status: string | null;
  service_price_at_booking: number | string | null;
};

type AnalyticsService = {
  name: string;
  category: string | null;
};

type AnalyticsClientProps = {
  slug: string;
  masterName: string;
  isPremium: boolean;
  appointments: AnalyticsAppointment[];
  services: AnalyticsService[];
  selectedPeriod: AnalyticsPeriod;
  selectedGroup: AnalyticsGroup;
  selectedStartDate: string;
  selectedEndDate: string;
};

const analyticsText = {
  en: {
    dashboardLabel: "Master dashboard",
    title: "Business analytics",
    subtitle:
      "Track bookings, cancellations, estimated revenue, and service performance.",
    premiumOnlyTitle: "Business analytics is a Premium feature",
    premiumOnlyText:
      "Upgrade to Premium to see revenue trends, average check, service performance, date-range forecasts, and CSV export for accounting.",
    billing: "Open billing",
    dashboard: "Dashboard",
    period: "Period",
    groupBy: "Group by",
    days30: "Last 30 days",
    days90: "Last 90 days",
    year: "Last 12 months",
    ytd: "YTD",
    custom: "Date range",
    allTime: "All time",
    startDate: "Start date",
    endDate: "End date",
    day: "Day",
    week: "Week",
    month: "Month",
    apply: "Apply",
    exportCsv: "Export CSV for accounting",
    confirmedBookings: "Confirmed bookings",
    cancelledBookings: "Cancelled bookings",
    estimatedRevenue: "Estimated revenue",
    averageCheck: "Average check",
    mostPopularService: "Most popular service",
    leastPopularService: "Least popular service",
    revenueTrend: "Revenue trend / forecast",
    servicePerformance: "Service performance",
    noData: "No confirmed bookings in this period yet.",
    bookings: "bookings",
    revenue: "Revenue",
    service: "Service",
    category: "Category",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    note:
      "Future confirmed appointments are included, so this page can also be used as a revenue forecast.",
  },
  es: {
    dashboardLabel: "Panel del maestro",
    title: "Analítica de negocio",
    subtitle:
      "Sigue reservas, cancelaciones, ingresos estimados y rendimiento de servicios.",
    premiumOnlyTitle: "La analítica de negocio es una función Premium",
    premiumOnlyText:
      "Actualiza a Premium para ver tendencias de ingresos, ticket promedio, rendimiento de servicios, pronósticos por fechas y exportación CSV para contabilidad.",
    billing: "Abrir facturación",
    dashboard: "Panel",
    period: "Periodo",
    groupBy: "Agrupar por",
    days30: "Últimos 30 días",
    days90: "Últimos 90 días",
    year: "Últimos 12 meses",
    ytd: "Desde inicio del año",
    custom: "Rango de fechas",
    allTime: "Todo el tiempo",
    startDate: "Fecha inicial",
    endDate: "Fecha final",
    day: "Día",
    week: "Semana",
    month: "Mes",
    apply: "Aplicar",
    exportCsv: "Exportar CSV para contabilidad",
    confirmedBookings: "Reservas confirmadas",
    cancelledBookings: "Reservas canceladas",
    estimatedRevenue: "Ingresos estimados",
    averageCheck: "Ticket promedio",
    mostPopularService: "Servicio más popular",
    leastPopularService: "Servicio menos popular",
    revenueTrend: "Tendencia / pronóstico de ingresos",
    servicePerformance: "Rendimiento de servicios",
    noData: "Todavía no hay reservas confirmadas en este periodo.",
    bookings: "reservas",
    revenue: "Ingresos",
    service: "Servicio",
    category: "Categoría",
    confirmed: "Confirmadas",
    cancelled: "Canceladas",
    note:
      "Las citas futuras confirmadas se incluyen, por eso esta página también sirve como pronóstico de ingresos.",
  },
  ru: {
    dashboardLabel: "Кабинет мастера",
    title: "Бизнес-аналитика",
    subtitle:
      "Отслеживайте записи, отмены, предполагаемую выручку и эффективность услуг.",
    premiumOnlyTitle: "Бизнес-аналитика доступна в Premium",
    premiumOnlyText:
      "Подключите Premium, чтобы видеть динамику выручки, средний чек, популярность услуг, прогноз по выбранным датам и CSV-экспорт для бухгалтерии.",
    billing: "Открыть оплату",
    dashboard: "Кабинет",
    period: "Период",
    groupBy: "Группировка",
    days30: "Последние 30 дней",
    days90: "Последние 90 дней",
    year: "Последние 12 месяцев",
    ytd: "С начала года",
    custom: "Диапазон дат",
    allTime: "Всё время",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    day: "День",
    week: "Неделя",
    month: "Месяц",
    apply: "Применить",
    exportCsv: "CSV-экспорт для бухгалтерии",
    confirmedBookings: "Подтверждённые записи",
    cancelledBookings: "Отменённые записи",
    estimatedRevenue: "Предполагаемая выручка",
    averageCheck: "Средний чек",
    mostPopularService: "Самая востребованная услуга",
    leastPopularService: "Самая невостребованная услуга",
    revenueTrend: "Динамика / прогноз выручки",
    servicePerformance: "Эффективность услуг",
    noData: "За выбранный период пока нет подтверждённых записей.",
    bookings: "записей",
    revenue: "Выручка",
    service: "Услуга",
    category: "Категория",
    confirmed: "Подтверждено",
    cancelled: "Отменено",
    note:
      "Будущие подтверждённые записи тоже учитываются, поэтому эту страницу можно использовать как прогноз выручки.",
  },
} satisfies Record<Locale, Record<string, string>>;

function getServiceLabel(serviceName: string, count: number) {
  if (!serviceName) return "-";
  return `${serviceName} (${count})`;
}

function buildAnalytics(params: {
  appointments: AnalyticsAppointment[];
  services: AnalyticsService[];
  group: AnalyticsGroup;
}) {
  const confirmed = params.appointments.filter((item) => item.status === "active");
  const cancelled = params.appointments.filter((item) => item.status === "cancelled");

  const estimatedRevenue = confirmed.reduce(
    (sum, item) => sum + toPriceNumber(item.service_price_at_booking),
    0
  );

  const averageCheck = confirmed.length > 0 ? estimatedRevenue / confirmed.length : 0;

  const serviceCategoryByName = new Map(
    params.services.map((service) => [
      service.name,
      service.category || "Uncategorized",
    ])
  );

  const allServiceNames = Array.from(
    new Set([
      ...params.services.map((service) => service.name),
      ...params.appointments.map((item) => item.service_name),
    ])
  );

  const serviceMap = new Map<
    string,
    {
      serviceName: string;
      category: string;
      count: number;
      cancelled: number;
      revenue: number;
    }
  >();

  for (const serviceName of allServiceNames) {
    serviceMap.set(serviceName, {
      serviceName,
      category: serviceCategoryByName.get(serviceName) || "Uncategorized",
      count: 0,
      cancelled: 0,
      revenue: 0,
    });
  }

  for (const item of params.appointments) {
    const current = serviceMap.get(item.service_name) || {
      serviceName: item.service_name,
      category: serviceCategoryByName.get(item.service_name) || "Uncategorized",
      count: 0,
      cancelled: 0,
      revenue: 0,
    };

    if (item.status === "active") {
      current.count += 1;
      current.revenue += toPriceNumber(item.service_price_at_booking);
    }

    if (item.status === "cancelled") {
      current.cancelled += 1;
    }

    serviceMap.set(item.service_name, current);
  }

  const serviceRows = Array.from(serviceMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.revenue !== a.revenue) return b.revenue - a.revenue;
    return a.serviceName.localeCompare(b.serviceName);
  });

  const mostPopular = serviceRows[0] || null;
  const leastPopular =
    [...serviceRows].sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      if (a.revenue !== b.revenue) return a.revenue - b.revenue;
      return a.serviceName.localeCompare(b.serviceName);
    })[0] || null;

  const groupMap = new Map<string, { label: string; revenue: number; count: number }>();

  for (const item of confirmed) {
    const label = getGroupKey(item.appointment_date, params.group);
    const current = groupMap.get(label) || { label, revenue: 0, count: 0 };
    current.revenue += toPriceNumber(item.service_price_at_booking);
    current.count += 1;
    groupMap.set(label, current);
  }

  const trendRows = Array.from(groupMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return {
    confirmed,
    cancelled,
    estimatedRevenue,
    averageCheck,
    mostPopular,
    leastPopular,
    serviceRows,
    trendRows,
  };
}

function AnalyticsClient({
  slug,
  masterName,
  isPremium,
  appointments,
  services,
  selectedPeriod,
  selectedGroup,
  selectedStartDate,
  selectedEndDate,
}: AnalyticsClientProps) {
  const { locale } = useLocale();
  const text = analyticsText[locale];

  const analytics = useMemo(
    () => buildAnalytics({ appointments, services, group: selectedGroup }),
    [appointments, services, selectedGroup]
  );

  const maxTrendRevenue = Math.max(
    1,
    ...analytics.trendRows.map((row) => row.revenue)
  );

  const exportParams = new URLSearchParams();
  exportParams.set("slug", slug);
  exportParams.set("period", selectedPeriod);
  exportParams.set("group", selectedGroup);

  if (selectedStartDate) exportParams.set("startDate", selectedStartDate);
  if (selectedEndDate) exportParams.set("endDate", selectedEndDate);

  const exportHref = `/api/export-appointments-csv?${exportParams.toString()}`;

  if (!isPremium) {
    return (
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-sm font-medium text-neutral-500">
            {text.dashboardLabel}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
            {text.premiumOnlyTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-600">
            {text.premiumOnlyText}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/dashboard/${slug}/billing`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {text.billing}
            </Link>
            <Link
              href={`/dashboard/${slug}`}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.dashboard}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              {text.dashboardLabel}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
              {text.title}
            </h1>
            <p className="mt-4 text-neutral-600">
              {masterName} — {text.subtitle}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">{text.note}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={exportHref}
              className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {text.exportCsv}
            </Link>
            <Link
              href={`/dashboard/${slug}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.dashboard}
            </Link>
          </div>
        </div>

        <form method="GET" className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.period}
              </label>
              <select
                name="period"
                defaultValue={selectedPeriod}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="30">{text.days30}</option>
                <option value="90">{text.days90}</option>
                <option value="365">{text.year}</option>
                <option value="ytd">{text.ytd}</option>
                <option value="custom">{text.custom}</option>
                <option value="all">{text.allTime}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.startDate}
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={selectedStartDate}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.endDate}
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={selectedEndDate}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.groupBy}
              </label>
              <select
                name="group"
                defaultValue={selectedGroup}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="day">{text.day}</option>
                <option value="week">{text.week}</option>
                <option value="month">{text.month}</option>
              </select>
            </div>

            <div className="flex items-end lg:col-span-2">
              <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                {text.apply}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-500">{text.confirmedBookings}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {analytics.confirmed.length}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-500">{text.cancelledBookings}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {analytics.cancelled.length}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-500">{text.estimatedRevenue}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {toMoney(analytics.estimatedRevenue)}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-500">{text.averageCheck}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {toMoney(analytics.averageCheck)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500">{text.mostPopularService}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {analytics.mostPopular
                ? getServiceLabel(analytics.mostPopular.serviceName, analytics.mostPopular.count)
                : "-"}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500">{text.leastPopularService}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {analytics.leastPopular
                ? getServiceLabel(analytics.leastPopular.serviceName, analytics.leastPopular.count)
                : "-"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">{text.revenueTrend}</h2>

          {analytics.trendRows.length === 0 ? (
            <p className="mt-6 text-neutral-500">{text.noData}</p>
          ) : (
            <div className="mt-6 space-y-4">
              {analytics.trendRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-neutral-800">{row.label}</span>
                    <span className="text-neutral-600">
                      {toMoney(row.revenue)} · {row.count} {text.bookings}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-100">
                    <div
                      className="h-3 rounded-full bg-neutral-900"
                      style={{
                        width: `${Math.max(4, (row.revenue / maxTrendRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {text.servicePerformance}
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-semibold">{text.service}</th>
                  <th className="px-4 py-3 font-semibold">{text.category}</th>
                  <th className="px-4 py-3 font-semibold">{text.confirmed}</th>
                  <th className="px-4 py-3 font-semibold">{text.cancelled}</th>
                  <th className="px-4 py-3 font-semibold">{text.revenue}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.serviceRows.length > 0 ? (
                  analytics.serviceRows.map((row) => (
                    <tr key={row.serviceName} className="border-t border-neutral-200">
                      <td className="px-4 py-3">{row.serviceName}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.count}</td>
                      <td className="px-4 py-3">{row.cancelled}</td>
                      <td className="px-4 py-3">{toMoney(row.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      {text.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AnalyticsClient;
