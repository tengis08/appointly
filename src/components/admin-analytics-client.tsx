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
  type AnalyticsSort,
} from "@/lib/analytics";

type AdminAppointment = {
  id: number | string;
  master_slug: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  status: string | null;
  service_price_at_booking: number | string | null;
};

type AdminMaster = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
};

type AdminService = {
  master_slug: string;
  name: string;
  category: string | null;
};

type AdminAnalyticsClientProps = {
  appointments: AdminAppointment[];
  masters: AdminMaster[];
  services: AdminService[];
  categories: string[];
  countries: string[];
  cities: string[];
  selectedCountry: string;
  selectedCity: string;
  selectedMaster: string;
  selectedCategory: string;
  selectedPeriod: AnalyticsPeriod;
  selectedGroup: AnalyticsGroup;
  selectedStartDate: string;
  selectedEndDate: string;
  selectedSort: AnalyticsSort;
};

const textByLocale = {
  en: {
    title: "Admin business analytics",
    subtitle:
      "See estimated revenue, category performance, and master rankings across Appointly.",
    appointments: "Appointments",
    masters: "Masters",
    adminLogout: "Admin logout",
    country: "Country",
    allCountries: "All countries",
    city: "City",
    allCities: "All cities",
    master: "Master",
    allMasters: "All masters",
    category: "Service category",
    allCategories: "All categories",
    period: "Period",
    days30: "Last 30 days",
    days90: "Last 90 days",
    year: "Last 12 months",
    ytd: "YTD",
    custom: "Date range",
    allTime: "All time",
    startDate: "Start date",
    endDate: "End date",
    groupBy: "Group by",
    day: "Day",
    week: "Week",
    month: "Month",
    sortMastersBy: "Sort masters by",
    revenue: "Revenue",
    bookings: "Bookings",
    name: "Name",
    apply: "Apply filters",
    reset: "Reset",
    exportCsv: "Export CSV for Excel",
    confirmedBookings: "Confirmed bookings",
    cancelledBookings: "Cancelled bookings",
    estimatedRevenue: "Estimated revenue",
    averageCheck: "Average check",
    revenueTrend: "Revenue trend / forecast",
    masterLeaderboard: "Master revenue leaderboard",
    categoryPerformance: "Category performance",
    noData: "No confirmed appointments for this filter.",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    average: "Average check",
    note:
      "Future confirmed appointments are included. Use country, city, category, and custom date range filters to compare markets and forecast future revenue.",
  },
  es: {
    title: "Analítica de negocio para admin",
    subtitle:
      "Consulta ingresos estimados, rendimiento por categoría y ranking de maestros en Appointly.",
    appointments: "Citas",
    masters: "Maestros",
    adminLogout: "Salir de admin",
    country: "País",
    allCountries: "Todos los países",
    city: "Ciudad",
    allCities: "Todas las ciudades",
    master: "Maestro",
    allMasters: "Todos los maestros",
    category: "Categoría",
    allCategories: "Todas las categorías",
    period: "Periodo",
    days30: "Últimos 30 días",
    days90: "Últimos 90 días",
    year: "Últimos 12 meses",
    ytd: "Desde inicio del año",
    custom: "Rango de fechas",
    allTime: "Todo el tiempo",
    startDate: "Fecha inicial",
    endDate: "Fecha final",
    groupBy: "Agrupar por",
    day: "Día",
    week: "Semana",
    month: "Mes",
    sortMastersBy: "Ordenar maestros por",
    revenue: "Ingresos",
    bookings: "Reservas",
    name: "Nombre",
    apply: "Aplicar filtros",
    reset: "Restablecer",
    exportCsv: "Exportar CSV para Excel",
    confirmedBookings: "Reservas confirmadas",
    cancelledBookings: "Reservas canceladas",
    estimatedRevenue: "Ingresos estimados",
    averageCheck: "Ticket promedio",
    revenueTrend: "Tendencia / pronóstico de ingresos",
    masterLeaderboard: "Ranking de ingresos por maestro",
    categoryPerformance: "Rendimiento por categoría",
    noData: "No hay citas confirmadas para este filtro.",
    confirmed: "Confirmadas",
    cancelled: "Canceladas",
    average: "Ticket promedio",
    note:
      "Las citas futuras confirmadas se incluyen. Usa filtros de país, ciudad, categoría y rango de fechas para comparar mercados y pronosticar ingresos futuros.",
  },
  ru: {
    title: "Бизнес-аналитика администратора",
    subtitle:
      "Смотрите предполагаемую выручку, эффективность категорий и рейтинг мастеров по Appointly.",
    appointments: "Записи",
    masters: "Мастера",
    adminLogout: "Выйти из admin",
    country: "Страна",
    allCountries: "Все страны",
    city: "Город",
    allCities: "Все города",
    master: "Мастер",
    allMasters: "Все мастера",
    category: "Категория услуг",
    allCategories: "Все категории",
    period: "Период",
    days30: "Последние 30 дней",
    days90: "Последние 90 дней",
    year: "Последние 12 месяцев",
    ytd: "С начала года",
    custom: "Диапазон дат",
    allTime: "Всё время",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    groupBy: "Группировка",
    day: "День",
    week: "Неделя",
    month: "Месяц",
    sortMastersBy: "Сортировать мастеров по",
    revenue: "Выручка",
    bookings: "Записи",
    name: "Имя",
    apply: "Применить фильтры",
    reset: "Сбросить",
    exportCsv: "CSV-экспорт для Excel",
    confirmedBookings: "Подтверждённые записи",
    cancelledBookings: "Отменённые записи",
    estimatedRevenue: "Предполагаемая выручка",
    averageCheck: "Средний чек",
    revenueTrend: "Динамика / прогноз выручки",
    masterLeaderboard: "Рейтинг мастеров по выручке",
    categoryPerformance: "Эффективность категорий",
    noData: "По этому фильтру нет подтверждённых записей.",
    confirmed: "Подтверждено",
    cancelled: "Отменено",
    average: "Средний чек",
    note:
      "Будущие подтверждённые записи тоже учитываются. Используйте фильтры по стране, городу, категории и датам, чтобы сравнивать рынки и прогнозировать будущую выручку.",
  },
} satisfies Record<Locale, Record<string, string>>;

function getMasterName(masterBySlug: Map<string, string>, slug: string) {
  return masterBySlug.get(slug) || slug;
}

function getServiceCategory(
  serviceByKey: Map<string, string>,
  appointment: AdminAppointment
) {
  return (
    serviceByKey.get(`${appointment.master_slug}::${appointment.service_name}`) ||
    "Uncategorized"
  );
}

function getAverage(revenue: number, count: number) {
  return count > 0 ? revenue / count : 0;
}

function masterMatchesLocation(params: {
  master: AdminMaster;
  selectedCountry: string;
  selectedCity: string;
}) {
  const countryMatches = params.selectedCountry
    ? params.master.country === params.selectedCountry
    : true;

  const cityMatches = params.selectedCity
    ? params.master.city === params.selectedCity
    : true;

  return countryMatches && cityMatches;
}

function AdminAnalyticsClient({
  appointments,
  masters,
  services,
  categories,
  countries,
  cities,
  selectedCountry,
  selectedCity,
  selectedMaster,
  selectedCategory,
  selectedPeriod,
  selectedGroup,
  selectedStartDate,
  selectedEndDate,
  selectedSort,
}: AdminAnalyticsClientProps) {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  const masterBySlug = useMemo(
    () => new Map(masters.map((master) => [master.slug, master.name])),
    [masters]
  );

  const serviceByKey = useMemo(
    () =>
      new Map(
        services.map((service) => [
          `${service.master_slug}::${service.name}`,
          service.category || "Uncategorized",
        ])
      ),
    [services]
  );

  const mastersForDropdown = useMemo(() => {
    return masters.filter((master) =>
      masterMatchesLocation({ master, selectedCountry, selectedCity })
    );
  }, [masters, selectedCity, selectedCountry]);

  const analytics = useMemo(() => {
    const confirmed = appointments.filter((item) => item.status === "active");
    const cancelled = appointments.filter((item) => item.status === "cancelled");

    const estimatedRevenue = confirmed.reduce(
      (sum, item) => sum + toPriceNumber(item.service_price_at_booking),
      0
    );

    const averageCheck = getAverage(estimatedRevenue, confirmed.length);

    const trendMap = new Map<
      string,
      { label: string; revenue: number; count: number }
    >();

    for (const item of confirmed) {
      const label = getGroupKey(item.appointment_date, selectedGroup);
      const current = trendMap.get(label) || { label, revenue: 0, count: 0 };
      current.revenue += toPriceNumber(item.service_price_at_booking);
      current.count += 1;
      trendMap.set(label, current);
    }

    const trendRows = Array.from(trendMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    const masterMap = new Map<
      string,
      {
        masterSlug: string;
        masterName: string;
        confirmed: number;
        cancelled: number;
        revenue: number;
      }
    >();

    for (const master of mastersForDropdown) {
      masterMap.set(master.slug, {
        masterSlug: master.slug,
        masterName: master.name,
        confirmed: 0,
        cancelled: 0,
        revenue: 0,
      });
    }

    for (const item of appointments) {
      const current =
        masterMap.get(item.master_slug) ||
        {
          masterSlug: item.master_slug,
          masterName: getMasterName(masterBySlug, item.master_slug),
          confirmed: 0,
          cancelled: 0,
          revenue: 0,
        };

      if (item.status === "active") {
        current.confirmed += 1;
        current.revenue += toPriceNumber(item.service_price_at_booking);
      }

      if (item.status === "cancelled") {
        current.cancelled += 1;
      }

      masterMap.set(item.master_slug, current);
    }

    const masterRows = Array.from(masterMap.values()).filter(
      (row) => row.confirmed > 0 || row.cancelled > 0 || !selectedMaster
    );

    masterRows.sort((a, b) => {
      if (selectedSort === "name") return a.masterName.localeCompare(b.masterName);
      if (selectedSort === "bookings") return b.confirmed - a.confirmed;
      return b.revenue - a.revenue;
    });

    const categoryMap = new Map<
      string,
      { category: string; confirmed: number; cancelled: number; revenue: number }
    >();

    for (const item of appointments) {
      const category = getServiceCategory(serviceByKey, item);
      const categoryRow = categoryMap.get(category) || {
        category,
        confirmed: 0,
        cancelled: 0,
        revenue: 0,
      };

      if (item.status === "active") {
        categoryRow.confirmed += 1;
        categoryRow.revenue += toPriceNumber(item.service_price_at_booking);
      }

      if (item.status === "cancelled") {
        categoryRow.cancelled += 1;
      }

      categoryMap.set(category, categoryRow);
    }

    const categoryRows = Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    return {
      confirmed,
      cancelled,
      estimatedRevenue,
      averageCheck,
      trendRows,
      masterRows,
      categoryRows,
    };
  }, [
    appointments,
    masterBySlug,
    mastersForDropdown,
    selectedGroup,
    selectedMaster,
    selectedSort,
    serviceByKey,
  ]);

  const maxTrendRevenue = Math.max(
    1,
    ...analytics.trendRows.map((row) => row.revenue)
  );
  const maxMasterRevenue = Math.max(
    1,
    ...analytics.masterRows.map((row) => row.revenue)
  );

  const exportParams = new URLSearchParams();

  if (selectedCountry) exportParams.set("country", selectedCountry);
  if (selectedCity) exportParams.set("city", selectedCity);
  if (selectedMaster) exportParams.set("master", selectedMaster);
  if (selectedCategory) exportParams.set("category", selectedCategory);

  exportParams.set("period", selectedPeriod);
  exportParams.set("group", selectedGroup);
  exportParams.set("sort", selectedSort);

  if (selectedStartDate) exportParams.set("startDate", selectedStartDate);
  if (selectedEndDate) exportParams.set("endDate", selectedEndDate);

  const exportHref = `/api/export-admin-appointments-csv?${exportParams.toString()}`;

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              {text.title}
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-neutral-600">
              {text.subtitle}
            </p>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-500">
              {text.note}
            </p>
          </div>

          <form action="/api/admin-logout" method="POST">
            <button className="rounded-full border border-red-300 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50">
              {text.adminLogout}
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/appointments"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            {text.appointments}
          </Link>
          <Link
            href="/masters"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            {text.masters}
          </Link>
          <Link
            href={exportHref}
            className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {text.exportCsv}
          </Link>
        </div>

        <form method="GET" className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.country}
              </label>
              <select
                name="country"
                defaultValue={selectedCountry}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">{text.allCountries}</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.city}
              </label>
              <select
                name="city"
                defaultValue={selectedCity}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">{text.allCities}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.master}
              </label>
              <select
                name="master"
                defaultValue={selectedMaster}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">{text.allMasters}</option>
                {mastersForDropdown.map((master) => (
                  <option key={master.slug} value={master.slug}>
                    {master.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.category}
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">{text.allCategories}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

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
                {text.sortMastersBy}
              </label>
              <select
                name="sort"
                defaultValue={selectedSort}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="revenue">{text.revenue}</option>
                <option value="bookings">{text.bookings}</option>
                <option value="name">{text.name}</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                {text.apply}
              </button>
              <Link
                href="/appointments-analytics"
                className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                {text.reset}
              </Link>
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

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {text.revenueTrend}
          </h2>
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
            {text.masterLeaderboard}
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-semibold">{text.master}</th>
                  <th className="px-4 py-3 font-semibold">{text.confirmed}</th>
                  <th className="px-4 py-3 font-semibold">{text.cancelled}</th>
                  <th className="px-4 py-3 font-semibold">{text.average}</th>
                  <th className="px-4 py-3 font-semibold">{text.revenue}</th>
                  <th className="px-4 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {analytics.masterRows.length > 0 ? (
                  analytics.masterRows.map((row) => (
                    <tr key={row.masterSlug} className="border-t border-neutral-200">
                      <td className="px-4 py-3 font-medium">{row.masterName}</td>
                      <td className="px-4 py-3">{row.confirmed}</td>
                      <td className="px-4 py-3">{row.cancelled}</td>
                      <td className="px-4 py-3">
                        {toMoney(getAverage(row.revenue, row.confirmed))}
                      </td>
                      <td className="px-4 py-3 font-semibold">{toMoney(row.revenue)}</td>
                      <td className="px-4 py-3">
                        <div className="h-3 min-w-32 rounded-full bg-neutral-100">
                          <div
                            className="h-3 rounded-full bg-neutral-900"
                            style={{
                              width: `${Math.max(4, (row.revenue / maxMasterRevenue) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      {text.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {text.categoryPerformance}
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-semibold">{text.category}</th>
                  <th className="px-4 py-3 font-semibold">{text.confirmed}</th>
                  <th className="px-4 py-3 font-semibold">{text.cancelled}</th>
                  <th className="px-4 py-3 font-semibold">{text.revenue}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryRows.length > 0 ? (
                  analytics.categoryRows.map((row) => (
                    <tr key={row.category} className="border-t border-neutral-200">
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.confirmed}</td>
                      <td className="px-4 py-3">{row.cancelled}</td>
                      <td className="px-4 py-3">{toMoney(row.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
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

export default AdminAnalyticsClient;
