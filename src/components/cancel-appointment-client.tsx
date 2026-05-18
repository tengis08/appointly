"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

type Appointment = {
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  status: string | null;
};

type CancelAppointmentClientProps = {
  token: string;
  appointment: Appointment | null;
  cancelledNow: boolean;
};

const cancelText = {
  en: {
    title: "Cancel appointment",
    invalidLink: "This cancellation link is invalid or expired.",
    appointmentCancelled: "Appointment cancelled",
    cancelledText: "This booking request has been cancelled.",
    confirmText:
      "Please confirm that you want to cancel this booking request.",
    client: "Client",
    service: "Service",
    date: "Date",
    time: "Time",
    cancelButton: "Cancel appointment",
    backToAppointly: "Back to Appointly",
  },
  es: {
    title: "Cancelar cita",
    invalidLink: "Este enlace de cancelación no es válido o expiró.",
    appointmentCancelled: "Cita cancelada",
    cancelledText: "Esta solicitud de reserva fue cancelada.",
    confirmText:
      "Confirma que quieres cancelar esta solicitud de reserva.",
    client: "Cliente",
    service: "Servicio",
    date: "Fecha",
    time: "Hora",
    cancelButton: "Cancelar cita",
    backToAppointly: "Volver a Appointly",
  },
  ru: {
    title: "Отменить запись",
    invalidLink: "Эта ссылка отмены недействительна или устарела.",
    appointmentCancelled: "Запись отменена",
    cancelledText: "Эта заявка на запись была отменена.",
    confirmText: "Подтвердите, что хотите отменить эту заявку на запись.",
    client: "Клиент",
    service: "Услуга",
    date: "Дата",
    time: "Время",
    cancelButton: "Отменить запись",
    backToAppointly: "Назад в Appointly",
  },
} satisfies Record<Locale, Record<string, string>>;

export function CancelAppointmentClient({
  token,
  appointment,
  cancelledNow,
}: CancelAppointmentClientProps) {
  const { locale } = useLocale();
  const text = cancelText[locale];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {text.title}
          </h1>

          {!appointment && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <p className="text-red-700">{text.invalidLink}</p>
            </div>
          )}

          {appointment && (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
              {cancelledNow || appointment.status === "cancelled" ? (
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    {text.appointmentCancelled}
                  </h2>
                  <p className="mt-3 text-neutral-600">
                    {text.cancelledText}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-neutral-600">{text.confirmText}</p>

                  <div className="mt-6 space-y-2 text-sm text-neutral-700">
                    <p>
                      <strong>{text.client}:</strong>{" "}
                      {appointment.client_name}
                    </p>
                    <p>
                      <strong>{text.service}:</strong>{" "}
                      {appointment.service_name}
                    </p>
                    <p>
                      <strong>{text.date}:</strong>{" "}
                      {appointment.appointment_date}
                    </p>
                    <p>
                      <strong>{text.time}:</strong>{" "}
                      {appointment.appointment_time}
                    </p>
                  </div>

                  <form
                    action="/api/cancel-appointment"
                    method="POST"
                    className="mt-6"
                  >
                    <input type="hidden" name="token" value={token} />

                    <button
                      type="submit"
                      className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      {text.cancelButton}
                    </button>
                  </form>
                </div>
              )}

              <Link
                href="/"
                className="mt-6 inline-block text-sm underline underline-offset-4"
              >
                {text.backToAppointly}
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}