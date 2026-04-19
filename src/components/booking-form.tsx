"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/types/master";

type BookingFormProps = {
  masterSlug: string;
  services: Service[];
};

export function BookingForm({ masterSlug, services }: BookingFormProps) {
  const [serviceName, setServiceName] = useState(services[0]?.name ?? "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");

    if (clientEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setStatus("error");
      setErrorText("Emails do not match.");
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      {
        master_slug: masterSlug,
        service_name: serviceName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
      },
    ]);

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }

    setStatus("success");
    setAppointmentDate("");
    setAppointmentTime("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setConfirmEmail("");

    if (services[0]?.name) {
      setServiceName(services[0].name);
    }
  }

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
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Preferred time
          </label>
          <input
            type="time"
            required
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
          />
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

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : "Request booking"}
        </button>

        {status === "success" && (
          <p className="text-sm font-medium text-green-600">
            Your booking request has been sent successfully.
          </p>
        )}

        {status === "error" && (
          <p className="text-sm font-medium text-red-600">
            Something went wrong: {errorText}
          </p>
        )}
      </form>
    </div>
  );
}