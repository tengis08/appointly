"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTimeLabel, getTodayDateString } from "@/lib/booking";
import type { Service } from "@/types/master";
import { TurnstileWidget } from "@/components/turnstile-widget";

type BookingFormProps = {
  masterSlug: string;
  services: Service[];
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function BookingForm({ masterSlug, services }: BookingFormProps) {
  const [serviceName, setServiceName] = useState(services[0]?.name ?? "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorText, setErrorText] = useState("");

  const minDate = useMemo(() => getTodayDateString(), []);

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
      setErrorText("Emails do not match.");
      return;
    }

    if (!appointmentTime) {
      setStatus("error");
      setErrorText("Please select an available time slot.");
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setErrorText("Please complete the security check.");
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
        turnstileToken,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setErrorText(data?.error || "Booking request failed.");
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
    setAvailableSlots([]);
    setTurnstileToken("");

    if (services[0]?.name) {
      setServiceName(services[0].name);
    }
  }

  const slotsPlaceholder = !appointmentDate
    ? "Select a date first"
    : slotsLoading
      ? "Loading available slots..."
      : availableSlots.length === 0
        ? "No available slots"
        : "Select a time slot";

  return (
    <div className="rounded-3xl border border-neutral-200 p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Book an appointment
      </h2>

      <p className="mt-3 text-sm leading-6 text-neutral-600">
        Choose a service and leave your details to request a booking.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Service
          </label>

          <select
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
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
            Preferred date
          </label>

          <input
            type="date"
            required
            min={minDate}
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Available time slots
          </label>

          <select
            required
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            disabled={
              !appointmentDate || slotsLoading || availableSlots.length === 0
            }
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
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
              No free slots are available for this date.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Your name
          </label>

          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Phone
          </label>

          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            placeholder="+1 (___) ___-____"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Email
          </label>

          <input
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Confirm email
          </label>

          <input
            type="email"
            required
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            placeholder="Repeat your email"
          />
        </div>

        {turnstileSiteKey ? (
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-800">
              Security check
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
            Turnstile site key is missing. Booking security check is not
            visible.
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : "Request booking"}
        </button>

        {status === "success" && (
          <p className="text-sm font-medium text-green-700">
            Your booking request has been sent successfully.
          </p>
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