"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTimeLabel } from "@/lib/booking";
import type { Service } from "@/types/master";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import {
  addDaysToDateString,
  getDateStringInTimeZone,
  getTimeZoneLabel,
  timeZoneText,
} from "@/lib/timezones";

type BookingThemeClasses = {
  border: string;
  heading: string;
  muted: string;
  button: string;
  focus: string;
  infoBox: string;
};

type BookingFormProps = {
  masterSlug: string;
  services: Service[];
  bookingWindowDays: number;
  masterTimeZone: string;
  customBookingMessage?: string;
  bookingPolicyText?: string;
  themeClasses?: BookingThemeClasses;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const bookingConfirmationText = {
  en: {
    successTitle: "Almost done. Please confirm your email.",
    successText:
      "We sent a confirmation link to your email. Your appointment is not confirmed until you click that link. Please check your inbox and spam folder.",
    timeZoneNote: timeZoneText.en.timesShownIn,
    bookingPolicyTitle: "Booking / cancellation policy",
  },
  es: {
    successTitle: "Casi listo. Confirma tu email.",
    successText:
      "Enviamos un enlace de confirmación a tu email. Tu cita no queda confirmada hasta que hagas clic en ese enlace. Revisa tu bandeja de entrada y spam.",
    timeZoneNote: timeZoneText.es.timesShownIn,
    bookingPolicyTitle: "Política de reserva / cancelación",
  },
  ru: {
    successTitle: "Почти готово. Подтвердите email.",
    successText:
      "Мы отправили ссылку подтверждения на ваш email. Запись не будет подтверждена, пока вы не нажмёте на эту ссылку. Проверьте папку «Входящие» и «Спам».",
    timeZoneNote: timeZoneText.ru.timesShownIn,
    bookingPolicyTitle: "Правила записи / отмены",
  },
} satisfies Record<Locale, Record<string, string>>;

export function BookingForm({
  masterSlug,
  services,
  bookingWindowDays,
  masterTimeZone,
  customBookingMessage,
  bookingPolicyText,
  themeClasses,
}: BookingFormProps) {
  const { locale, t } = useLocale();
  const confirmationText = bookingConfirmationText[locale];

  const [serviceName, setServiceName] = useState(services[0]?.name ?? "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorText, setErrorText] = useState("");

  const minDate = useMemo(
    () => getDateStringInTimeZone(new Date(), masterTimeZone),
    [masterTimeZone]
  );

  const maxDate = useMemo(
    () => addDaysToDateString(minDate, Math.max(1, bookingWindowDays)),
    [minDate, bookingWindowDays]
  );

  useEffect(() => {
    setAppointmentTime("");
    setAvailableSlots([]);

    if (!appointmentDate || !serviceName) {
      return;
    }

    let isActive = true;

    async function loadSlots() {
      try {
        setSlotsLoading(true);

        const params = new URLSearchParams({
          masterSlug,
          date: appointmentDate,
          serviceName,
        });

        const response = await fetch(
          `/api/available-slots?${params.toString()}`
        );

        const data = await response.json().catch(() => null);

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setAvailableSlots([]);
          return;
        }

        setAvailableSlots(data?.slots ?? []);
      } finally {
        if (isActive) {
          setSlotsLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      isActive = false;
    };
  }, [appointmentDate, serviceName, masterSlug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("loading");
    setErrorText("");

    if (clientEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setStatus("error");
      setErrorText(t.emailsDoNotMatch);
      return;
    }

    if (!appointmentTime) {
      setStatus("error");
      setErrorText(t.selectAvailableTimeSlot);
      return;
    }

    if (clientNote.trim().length > 400) {
      setStatus("error");
      setErrorText(t.clientNoteTooLong);
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setErrorText(t.completeSecurityCheck);
      return;
    }

    const response = await fetch("/api/book-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        masterSlug,
        serviceName,
        appointmentDate,
        appointmentTime,
        clientName,
        clientPhone,
        clientEmail,
        clientNote,
        turnstileToken,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setErrorText(data?.error || t.bookingFailed);
      setTurnstileToken("");
      return;
    }

    setStatus("success");
    setAppointmentDate("");
    setAppointmentTime("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setConfirmEmail("");
    setClientNote("");
    setAvailableSlots([]);
    setTurnstileToken("");

    if (services[0]?.name) {
      setServiceName(services[0].name);
    }
  }

  const slotsPlaceholder = !appointmentDate
    ? t.selectDateFirst
    : slotsLoading
      ? t.loadingAvailableSlots
      : availableSlots.length === 0
        ? t.noAvailableSlots
        : t.selectTimeSlot;

  const theme = themeClasses || {
    border: "border-neutral-200",
    heading: "text-neutral-900",
    muted: "text-neutral-600",
    button: "bg-neutral-900 text-white hover:bg-neutral-800",
    focus: "focus:border-neutral-500",
    infoBox: "border-neutral-200 bg-neutral-50 text-neutral-700",
  };

  const customMessage = customBookingMessage?.trim() || "";
  const policyText = bookingPolicyText?.trim() || "";

  return (
    <div className={`rounded-3xl border p-6 ${theme.border}`}>
      <h2 className={`text-2xl font-semibold tracking-tight ${theme.heading}`}>
        {t.bookAppointment}
      </h2>

      {customMessage && (
        <div className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${theme.infoBox}`}>
          <p className="whitespace-pre-line">{customMessage}</p>
        </div>
      )}

      {policyText && (
        <div className={`mt-3 rounded-2xl border p-4 text-sm leading-6 ${theme.infoBox}`}>
          <p className={`font-semibold ${theme.heading}`}>
            {confirmationText.bookingPolicyTitle}
          </p>
          <p className="mt-2 whitespace-pre-line">{policyText}</p>
        </div>
      )}

      <p className={`mt-4 text-sm leading-6 ${theme.muted}`}>
        {t.bookingFormSubtitle}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {confirmationText.timeZoneNote}: {getTimeZoneLabel(masterTimeZone)}.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.service}
          </label>

          <select
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
          >
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name} — {service.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.preferredDate}
          </label>

          <input
            type="date"
            required
            min={minDate}
            max={maxDate}
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.availableTimeSlots}
          </label>

          <select
            required
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            disabled={
              !appointmentDate || slotsLoading || availableSlots.length === 0
            }
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus} disabled:cursor-not-allowed disabled:bg-neutral-100`}
          >
            <option value="">{slotsPlaceholder}</option>

            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {formatTimeLabel(slot)}
              </option>
            ))}
          </select>

          {appointmentDate && !slotsLoading && availableSlots.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              {t.noFreeSlotsForDate}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.yourName}
          </label>

          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
            placeholder={t.yourNamePlaceholder}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.phone}
          </label>

          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
            placeholder="+1 (___) ___-____"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.email}
          </label>

          <input
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t.confirmEmail}
          </label>

          <input
            type="email"
            required
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
            placeholder={t.confirmEmailPlaceholder}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label className="block text-sm font-medium text-neutral-800">
              {t.clientNote}
            </label>

            <span className="text-xs text-neutral-500">
              {clientNote.length}/400
            </span>
          </div>

          <textarea
            value={clientNote}
            onChange={(e) => setClientNote(e.target.value.slice(0, 400))}
            rows={4}
            maxLength={400}
            className={`w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition ${theme.focus}`}
            placeholder={t.clientNotePlaceholder}
          />

          <p className="mt-2 text-sm text-neutral-500">{t.clientNoteHelp}</p>
        </div>

        {turnstileSiteKey ? (
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-800">
              {t.securityCheck}
            </p>

            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            {t.missingBookingTurnstileSiteKey}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
        >
          {status === "loading" ? t.bookingSending : t.requestBooking}
        </button>

        {status === "success" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">{confirmationText.successTitle}</p>
            <p className="mt-2">{confirmationText.successText}</p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorText}
          </div>
        )}
      </form>
    </div>
  );
}
