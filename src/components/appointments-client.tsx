"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { formatTimeLabel } from "@/lib/booking";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

type AppointmentRow = {
  id: number | string;
  master_slug: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
};

type MasterOption = {
  slug: string;
  name: string;
};

type AppointmentsClientProps = {
  appointments: AppointmentRow[];
  masterEntries: MasterOption[];
  selectedMaster: string;
  selectedDate: string;
  selectedSort: string;
  errorMessage: string | null;
};

const appointmentsText = {
  en: {
    title: "Appointments",
    subtitle: "Admin-only page for viewing booking requests.",
    master: "Master",
    allMasters: "All masters",
    date: "Date",
    sort: "Sort",
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    applyFilters: "Apply filters",
    reset: "Reset",
    totalRecords: "Total records",
    backToMasters: "Back to masters",
    analytics: "Analytics",
    adminLogout: "Admin logout",
    failedToLoad: "Failed to load appointments",
    noAppointmentsFound: "No appointments found",
    noAppointmentsText:
      "Try changing the filters or wait for new booking requests.",
    service: "Service",
    time: "Time",
    client: "Client",
    phone: "Phone",
    email: "Email",
    profile: "Profile",
    open: "Open",
  },

  es: {
    title: "Citas",
    subtitle: "Página solo para administrador para ver solicitudes de reserva.",
    master: "Maestro",
    allMasters: "Todos los maestros",
    date: "Fecha",
    sort: "Orden",
    newestFirst: "Más recientes primero",
    oldestFirst: "Más antiguas primero",
    applyFilters: "Aplicar filtros",
    reset: "Restablecer",
    totalRecords: "Total de registros",
    backToMasters: "Volver a maestros",
    analytics: "Analítica",
    adminLogout: "Salir de admin",
    failedToLoad: "No se pudieron cargar las citas",
    noAppointmentsFound: "No se encontraron citas",
    noAppointmentsText:
      "Cambia los filtros o espera nuevas solicitudes de reserva.",
    service: "Servicio",
    time: "Hora",
    client: "Cliente",
    phone: "Teléfono",
    email: "Email",
    profile: "Perfil",
    open: "Abrir",
  },

  ru: {
    title: "Записи",
    subtitle: "Страница только для администратора для просмотра заявок.",
    master: "Мастер",
    allMasters: "Все мастера",
    date: "Дата",
    sort: "Сортировка",
    newestFirst: "Сначала новые",
    oldestFirst: "Сначала старые",
    applyFilters: "Применить фильтры",
    reset: "Сбросить",
    totalRecords: "Всего записей",
    backToMasters: "Назад к мастерам",
    analytics: "Аналитика",
    adminLogout: "Выйти из admin",
    failedToLoad: "Не удалось загрузить записи",
    noAppointmentsFound: "Записи не найдены",
    noAppointmentsText:
      "Попробуйте изменить фильтры или дождитесь новых заявок.",
    service: "Услуга",
    time: "Время",
    client: "Клиент",
    phone: "Телефон",
    email: "Email",
    profile: "Профиль",
    open: "Открыть",
  },
} satisfies Record<Locale, Record<string, string>>;

export function AppointmentsClient({
  appointments,
  masterEntries,
  selectedMaster,
  selectedDate,
  selectedSort,
  errorMessage,
}: AppointmentsClientProps) {
  const { locale } = useLocale();
  const text = appointmentsText[locale];

  const masterNameBySlug = new Map(
    masterEntries.map((master) => [master.slug, master.name])
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                {text.title}
              </h1>

              <p className="mt-4 text-lg leading-8 text-neutral-600">
                {text.subtitle}
              </p>
            </div>

            <form action="/api/admin-logout" method="POST">
              <button className="rounded-full border border-red-300 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50">
                {text.adminLogout}
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
            <form method="GET" className="grid gap-4 md:grid-cols-4">
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

                  {masterEntries.map((master) => (
                    <option key={master.slug} value={master.slug}>
                      {master.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {text.date}
                </label>

                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {text.sort}
                </label>

                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  <option value="newest">{text.newestFirst}</option>
                  <option value="oldest">{text.oldestFirst}</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.applyFilters}
                </button>

                <Link
                  href="/appointments"
                  className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  {text.reset}
                </Link>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-neutral-600">
                {text.totalRecords}:{" "}
                <span className="font-semibold text-neutral-900">
                  {appointments.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/appointments-analytics"
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.analytics}
                </Link>

                <Link
                  href="/masters"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  {text.backToMasters}
                </Link>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-xl font-semibold text-red-700">
                {text.failedToLoad}
              </h2>
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {!errorMessage && appointments.length === 0 && (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                {text.noAppointmentsFound}
              </h2>
              <p className="mt-3 text-neutral-600">{text.noAppointmentsText}</p>
            </div>
          )}

          {!errorMessage && appointments.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-neutral-50">
                    <tr className="text-left text-sm text-neutral-700">
                      <th className="px-4 py-4 font-semibold">{text.master}</th>
                      <th className="px-4 py-4 font-semibold">{text.service}</th>
                      <th className="px-4 py-4 font-semibold">{text.date}</th>
                      <th className="px-4 py-4 font-semibold">{text.time}</th>
                      <th className="px-4 py-4 font-semibold">{text.client}</th>
                      <th className="px-4 py-4 font-semibold">{text.phone}</th>
                      <th className="px-4 py-4 font-semibold">{text.email}</th>
                      <th className="px-4 py-4 font-semibold">{text.profile}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment) => {
                      const masterName =
                        masterNameBySlug.get(appointment.master_slug) ||
                        appointment.master_slug;

                      return (
                        <tr
                          key={appointment.id}
                          className="border-t border-neutral-200 text-sm text-neutral-800"
                        >
                          <td className="px-4 py-4 font-medium">{masterName}</td>
                          <td className="px-4 py-4">
                            {appointment.service_name}
                          </td>
                          <td className="px-4 py-4">
                            {appointment.appointment_date}
                          </td>
                          <td className="px-4 py-4">
                            {formatTimeLabel(appointment.appointment_time)}
                          </td>
                          <td className="px-4 py-4">
                            {appointment.client_name}
                          </td>
                          <td className="px-4 py-4">
                            {appointment.client_phone || "-"}
                          </td>
                          <td className="px-4 py-4">
                            {appointment.client_email}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/${appointment.master_slug}`}
                              className="font-medium text-neutral-900 underline underline-offset-4"
                            >
                              {text.open}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}