"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

type WorkingDayRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type BlockedDateRow = {
  blocked_date: string;
  reason: string | null;
};

type AvailabilityClientProps = {
  slug: string;
  workingDays: WorkingDayRow[];
  blockedDates: BlockedDateRow[];
  saved: boolean;
  cancelledCount: number;
};

const availabilityText = {
  en: {
    label: "Master settings",
    title: "Availability",
    subtitle: "Set your working days, hours, and blocked dates.",
    saved: "Availability saved successfully.",
    cancelledPrefix: "Existing appointment(s) cancelled:",
    cancelledSuffix: "Clients were notified by email.",
    workingDay: "Working day",
    saveAvailability: "Save availability",
    backToDashboard: "Back to dashboard",
    weeklySchedule: "Weekly schedule",
    blockedDates: "Blocked dates",
    blockedDatesText:
      "Block vacation days, personal days, or any dates when clients should not book.",
    dateToBlock: "Date to block",
    reasonOptional: "Reason, optional",
    reasonPlaceholder: "Vacation, personal day, fully booked...",
    addBlockedDate: "Block date",
    noBlockedDates: "No blocked dates yet.",
    remove: "Remove",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  },

  es: {
    label: "Configuración del maestro",
    title: "Disponibilidad",
    subtitle: "Configura tus días, horarios y fechas bloqueadas.",
    saved: "Disponibilidad guardada correctamente.",
    cancelledPrefix: "Cita(s) existente(s) cancelada(s):",
    cancelledSuffix: "Los clientes fueron notificados por email.",
    workingDay: "Día laboral",
    saveAvailability: "Guardar disponibilidad",
    backToDashboard: "Volver al panel",
    weeklySchedule: "Horario semanal",
    blockedDates: "Fechas bloqueadas",
    blockedDatesText:
      "Bloquea vacaciones, días personales o cualquier fecha en la que no quieras recibir reservas.",
    dateToBlock: "Fecha para bloquear",
    reasonOptional: "Motivo, opcional",
    reasonPlaceholder: "Vacaciones, día personal, completo...",
    addBlockedDate: "Bloquear fecha",
    noBlockedDates: "Todavía no hay fechas bloqueadas.",
    remove: "Eliminar",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
  },

  ru: {
    label: "Настройки мастера",
    title: "График",
    subtitle: "Настройте рабочие дни, часы и заблокированные даты.",
    saved: "График успешно сохранён.",
    cancelledPrefix: "Отменено существующих записей:",
    cancelledSuffix: "Клиентам отправлены email-уведомления.",
    workingDay: "Рабочий день",
    saveAvailability: "Сохранить график",
    backToDashboard: "Назад в кабинет",
    weeklySchedule: "Недельный график",
    blockedDates: "Заблокированные даты",
    blockedDatesText:
      "Заблокируйте отпуск, личные дни или любые даты, когда клиенты не должны записываться.",
    dateToBlock: "Дата для блокировки",
    reasonOptional: "Причина, необязательно",
    reasonPlaceholder: "Отпуск, личный день, всё занято...",
    addBlockedDate: "Заблокировать дату",
    noBlockedDates: "Заблокированных дат пока нет.",
    remove: "Удалить",
    sunday: "Воскресенье",
    monday: "Понедельник",
    tuesday: "Вторник",
    wednesday: "Среда",
    thursday: "Четверг",
    friday: "Пятница",
    saturday: "Суббота",
  },
} satisfies Record<Locale, Record<string, string>>;

function getDayNames(text: Record<string, string>) {
  return [
    text.sunday,
    text.monday,
    text.tuesday,
    text.wednesday,
    text.thursday,
    text.friday,
    text.saturday,
  ];
}

export function AvailabilityClient({
  slug,
  workingDays,
  blockedDates,
  saved,
  cancelledCount,
}: AvailabilityClientProps) {
  const { locale } = useLocale();
  const text = availabilityText[locale];
  const dayNames = getDayNames(text);

  const map: Record<number, { start: string; end: string }> = {};

  for (const row of workingDays) {
    map[row.day_of_week] = {
      start: row.start_time,
      end: row.end_time,
    };
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-4xl px-6 py-14">
        <p className="mb-2 text-sm text-neutral-500">{text.label}</p>

        <h1 className="mb-4 text-5xl font-semibold text-neutral-900">
          {text.title}
        </h1>

        <p className="mb-10 text-neutral-600">{text.subtitle}</p>

        {saved && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            <p>{text.saved}</p>

            {cancelledCount > 0 && (
              <p className="mt-2">
                {text.cancelledPrefix} {cancelledCount}.{" "}
                {text.cancelledSuffix}
              </p>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-neutral-200 p-8">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {text.weeklySchedule}
          </h2>

          <form
            action="/api/save-master-availability"
            method="POST"
            className="mt-6 space-y-6"
          >
            <input type="hidden" name="slug" value={slug} />

            {dayNames.map((dayName, index) => {
              const row = map[index];

              return (
                <div
                  key={index}
                  className="grid items-center gap-4 border-b border-neutral-100 pb-4 md:grid-cols-4"
                >
                  <div className="font-medium text-neutral-900">{dayName}</div>

                  <label className="flex items-center gap-2 text-neutral-800">
                    <input
                      type="checkbox"
                      name={`enabled_${index}`}
                      defaultChecked={!!row}
                    />
                    {text.workingDay}
                  </label>

                  <input
                    type="time"
                    name={`start_${index}`}
                    defaultValue={row?.start || "10:00"}
                    className="rounded-xl border border-neutral-300 px-4 py-3"
                  />

                  <input
                    type="time"
                    name={`end_${index}`}
                    defaultValue={row?.end || "18:00"}
                    className="rounded-xl border border-neutral-300 px-4 py-3"
                  />
                </div>
              );
            })}

            <div className="flex flex-wrap gap-4 pt-6">
              <button className="rounded-2xl bg-black px-8 py-3 text-sm font-semibold text-white">
                {text.saveAvailability}
              </button>

              <Link
                href={`/dashboard/${slug}`}
                className="rounded-2xl border border-neutral-300 px-8 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                {text.backToDashboard}
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-8">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {text.blockedDates}
          </h2>

          <p className="mt-3 text-neutral-600">{text.blockedDatesText}</p>

          <form
            action="/api/add-master-blocked-date"
            method="POST"
            className="mt-6 grid gap-4 md:grid-cols-[1fr_1.5fr_auto]"
          >
            <input type="hidden" name="slug" value={slug} />

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.dateToBlock}
              </label>

              <input
                type="date"
                name="blockedDate"
                required
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.reasonOptional}
              </label>

              <input
                name="reason"
                placeholder={text.reasonPlaceholder}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div className="flex items-end">
              <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 md:w-auto">
                {text.addBlockedDate}
              </button>
            </div>
          </form>

          {blockedDates.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
              {text.noBlockedDates}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {blockedDates.map((item) => (
                <div
                  key={item.blocked_date}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {item.blocked_date}
                    </p>

                    {item.reason && (
                      <p className="mt-1 text-sm text-neutral-600">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  <form action="/api/delete-master-blocked-date" method="POST">
                    <input type="hidden" name="slug" value={slug} />
                    <input
                      type="hidden"
                      name="blockedDate"
                      value={item.blocked_date}
                    />

                    <button className="rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
                      {text.remove}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}