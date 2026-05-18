"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
};

type MasterDashboardClientProps = {
  slug: string;
  masterName: string;
  appointments: Appointment[];
  selectedStartDate: string;
  selectedEndDate: string;
  selectedSort: string;
  isPremium: boolean;
  hasCalendarFeed: boolean;
  calendarFeedUrl: string;
  calendarStatus: string;
  publicBookingUrl: string;
};

const dashboardText = {
  en: {
    dashboardLabel: "Master dashboard",
    subtitle:
      "View your active appointments. By default, only today's appointments are shown.",
    startDate: "Start date",
    endDate: "End date",
    sort: "Sort",
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    applyFilters: "Apply filters",
    today: "Today",
    openPublicPage: "Open public page",
    settings: "Settings",
    services: "Services",
    availability: "Availability",
    billing: "Billing",
    analytics: "Analytics",
    logout: "Logout",
    activeRecords: "Active records",
    time: "Time",
    service: "Service",
    client: "Client",
    phone: "Phone",
    comment: "Comment",
    noAppointments: "No active appointments found for this date range.",
    exportCalendar: "Export calendar (.ics)",
    downloadQrCode: "Download QR code",
    exportCalendarHelp:
      "Download selected appointments as a calendar file for Apple Calendar, Google Calendar, or Outlook.",
    liveCalendarTitle: "Live calendar subscription",
    liveCalendarText:
      "Premium masters can add this secret calendar link to Apple Calendar, Google Calendar, or Outlook. The calendar will keep appointments available on the phone and refresh them periodically. Update timing depends on the calendar app and account settings; on Apple devices, the Fetch schedule can be adjusted in Calendar settings.",
    liveCalendarPremiumOnly:
      "Live calendar subscription is available on Premium. Basic masters can still use one-time calendar export.",
    createCalendarLink: "Create live calendar link",
    regenerateCalendarLink: "Regenerate link",
    calendarLink: "Calendar subscription link",
    copyLink: "Copy link",
    copied: "Copied",
    calendarCreated: "Calendar subscription link created.",
    calendarRegenerated: "Calendar subscription link regenerated. Old link no longer works.",
    calendarWarning:
      "Keep this link private. Anyone with this link can view your appointment calendar.",
  },
  es: {
    dashboardLabel: "Panel del maestro",
    subtitle:
      "Consulta tus citas activas. Por defecto, solo se muestran las citas de hoy.",
    startDate: "Fecha inicial",
    endDate: "Fecha final",
    sort: "Orden",
    newestFirst: "Más recientes primero",
    oldestFirst: "Más antiguas primero",
    applyFilters: "Aplicar filtros",
    today: "Hoy",
    openPublicPage: "Abrir página pública",
    settings: "Configuración",
    services: "Servicios",
    availability: "Disponibilidad",
    billing: "Facturación",
    analytics: "Analítica",
    logout: "Cerrar sesión",
    activeRecords: "Registros activos",
    time: "Hora",
    service: "Servicio",
    client: "Cliente",
    phone: "Teléfono",
    comment: "Comentario",
    noAppointments: "No se encontraron citas activas para este rango.",
    exportCalendar: "Exportar calendario (.ics)",
    downloadQrCode: "Descargar código QR",
    exportCalendarHelp:
      "Descarga las citas seleccionadas como archivo de calendario para Apple Calendar, Google Calendar u Outlook.",
    liveCalendarTitle: "Suscripción de calendario en vivo",
    liveCalendarText:
      "Los maestros Premium pueden añadir este enlace secreto a Apple Calendar, Google Calendar u Outlook. El calendario mantendrá las citas disponibles en el teléfono y las actualizará periódicamente. El tiempo de actualización depende de la app de calendario y de la configuración de la cuenta; en dispositivos Apple, el horario de Fetch se puede ajustar en la configuración de Calendario.",
    liveCalendarPremiumOnly:
      "La suscripción de calendario en vivo está disponible en Premium. Los maestros Basic pueden usar la exportación única del calendario.",
    createCalendarLink: "Crear enlace de calendario",
    regenerateCalendarLink: "Regenerar enlace",
    calendarLink: "Enlace de suscripción del calendario",
    copyLink: "Copiar enlace",
    copied: "Copiado",
    calendarCreated: "Enlace de calendario creado.",
    calendarRegenerated: "Enlace regenerado. El enlace anterior ya no funciona.",
    calendarWarning:
      "Mantén este enlace privado. Cualquier persona con este enlace puede ver tu calendario de citas.",
  },
  ru: {
    dashboardLabel: "Кабинет мастера",
    subtitle:
      "Просматривайте активные записи. По умолчанию показываются только записи на сегодня.",
    startDate: "Начальная дата",
    endDate: "Конечная дата",
    sort: "Сортировка",
    newestFirst: "Сначала новые",
    oldestFirst: "Сначала старые",
    applyFilters: "Применить фильтры",
    today: "Сегодня",
    openPublicPage: "Открыть публичную страницу",
    settings: "Настройки",
    services: "Услуги",
    availability: "График",
    billing: "Оплата",
    analytics: "Аналитика",
    logout: "Выйти",
    activeRecords: "Активные записи",
    time: "Время",
    service: "Услуга",
    client: "Клиент",
    phone: "Телефон",
    comment: "Комментарий",
    noAppointments: "Активные записи за выбранный период не найдены.",
    exportCalendar: "Выгрузить календарь (.ics)",
    downloadQrCode: "Скачать QR-код",
    exportCalendarHelp:
      "Скачайте выбранные записи как календарный файл для Apple Calendar, Google Calendar или Outlook.",
    liveCalendarTitle: "Живая подписка на календарь",
    liveCalendarText:
      "Premium-мастера могут добавить эту секретную ссылку в Apple Calendar, Google Calendar или Outlook. Записи будут доступны в календаре телефона и будут периодически обновляться. Скорость обновления зависит от приложения календаря и настроек аккаунта; на Apple-устройствах расписание Fetch можно настроить в настройках Calendar.",
    liveCalendarPremiumOnly:
      "Живая подписка на календарь доступна в Premium. Basic-мастера могут использовать разовую выгрузку календаря.",
    createCalendarLink: "Создать ссылку календаря",
    regenerateCalendarLink: "Сгенерировать новую ссылку",
    calendarLink: "Ссылка подписки на календарь",
    copyLink: "Скопировать",
    copied: "Скопировано",
    calendarCreated: "Ссылка подписки на календарь создана.",
    calendarRegenerated: "Ссылка обновлена. Старая ссылка больше не работает.",
    calendarWarning:
      "Храните эту ссылку приватно. Любой человек с этой ссылкой сможет видеть календарь ваших записей.",
  },
} satisfies Record<Locale, Record<string, string>>;

function buildQuery(params: Record<string, string>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
}

export function MasterDashboardClient({
  slug,
  masterName,
  appointments,
  selectedStartDate,
  selectedEndDate,
  selectedSort,
  isPremium,
  hasCalendarFeed,
  calendarFeedUrl,
  calendarStatus,
  publicBookingUrl,
}: MasterDashboardClientProps) {
  const { locale } = useLocale();
  const text = dashboardText[locale];
  const [copied, setCopied] = useState(false);

  const todayHref = `/dashboard/${slug}`;
  const calendarExportQuery = buildQuery({
    slug,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    sort: selectedSort,
  });

  async function copyCalendarLink() {
    if (!calendarFeedUrl) return;

    await navigator.clipboard.writeText(calendarFeedUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-medium text-neutral-500">
          {text.dashboardLabel}
        </p>

        <h1 className="mt-2 text-5xl font-bold tracking-tight text-neutral-900">
          {masterName}
        </h1>

        <p className="mt-5 text-lg text-neutral-600">{text.subtitle}</p>

        <div className="mt-10 rounded-3xl border border-neutral-200 p-6">
          <form className="flex flex-wrap items-end gap-4" method="GET">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                {text.startDate}
              </label>

              <input
                type="date"
                name="startDate"
                defaultValue={selectedStartDate}
                className="rounded-2xl border border-neutral-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                {text.endDate}
              </label>

              <input
                type="date"
                name="endDate"
                defaultValue={selectedEndDate}
                className="rounded-2xl border border-neutral-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                {text.sort}
              </label>

              <select
                name="sort"
                defaultValue={selectedSort}
                className="rounded-2xl border border-neutral-300 px-4 py-3"
              >
                <option value="newest">{text.newestFirst}</option>
                <option value="oldest">{text.oldestFirst}</option>
              </select>
            </div>

            <button className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              {text.applyFilters}
            </button>

            <Link
              href={todayHref}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.today}
            </Link>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={publicBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.openPublicPage}
            </a>

            <a
              href={`/api/master-qr-code?slug=${encodeURIComponent(slug)}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.downloadQrCode}
            </a>

            <Link
              href={`/dashboard/${slug}/settings`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.settings}
            </Link>

            <Link
              href={`/dashboard/${slug}/services`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.services}
            </Link>

            <Link
              href={`/dashboard/${slug}/availability`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.availability}
            </Link>

            <Link
              href={`/dashboard/${slug}/billing`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.billing}
            </Link>

            <Link
              href={`/dashboard/${slug}/analytics`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.analytics}
            </Link>

            <a
              href={`/api/export-master-calendar-ics?${calendarExportQuery}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.exportCalendar}
            </a>

            <form action="/api/logout-master" method="POST">
              <button className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
                {text.logout}
              </button>
            </form>
          </div>


          <p className="mt-6 text-sm text-neutral-600">
            {text.activeRecords}: {appointments.length}
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                {text.liveCalendarTitle}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                {isPremium ? text.liveCalendarText : text.liveCalendarPremiumOnly}
              </p>
            </div>

            {!isPremium && (
              <Link
                href={`/dashboard/${slug}/billing`}
                className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {text.billing}
              </Link>
            )}
          </div>

          {isPremium && calendarStatus === "created" && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {text.calendarCreated}
            </div>
          )}

          {isPremium && calendarStatus === "regenerated" && (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
              {text.calendarRegenerated}
            </div>
          )}

          {isPremium && hasCalendarFeed && calendarFeedUrl && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  {text.calendarLink}
                </label>

                <input
                  value={calendarFeedUrl}
                  readOnly
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-800"
                />
              </div>

              <p className="text-sm text-red-600">{text.calendarWarning}</p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyCalendarLink}
                  className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {copied ? text.copied : text.copyLink}
                </button>

                <form action="/api/regenerate-calendar-feed-token" method="POST">
                  <input type="hidden" name="slug" value={slug} />

                  <button className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
                    {text.regenerateCalendarLink}
                  </button>
                </form>
              </div>
            </div>
          )}

          {isPremium && !hasCalendarFeed && (
            <form action="/api/create-calendar-feed-token" method="POST" className="mt-5">
              <input type="hidden" name="slug" value={slug} />

              <button className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                {text.createCalendarLink}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-700">
              <tr>
                <th className="px-5 py-4">{text.startDate}</th>
                <th className="px-5 py-4">{text.time}</th>
                <th className="px-5 py-4">{text.service}</th>
                <th className="px-5 py-4">{text.client}</th>
                <th className="px-5 py-4">{text.phone}</th>
                <th className="px-5 py-4">{text.comment}</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-neutral-200">
                  <td className="px-5 py-4">{appointment.appointment_date}</td>
                  <td className="px-5 py-4">{appointment.appointment_time}</td>
                  <td className="px-5 py-4">{appointment.service_name}</td>
                  <td className="px-5 py-4">{appointment.client_name}</td>
                  <td className="px-5 py-4">{appointment.client_phone || "—"}</td>
                  <td className="max-w-md px-5 py-4 leading-6">
                    {appointment.client_note || "—"}
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-neutral-500" colSpan={6}>
                    {text.noAppointments}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
