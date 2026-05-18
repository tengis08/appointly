import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { sendMasterNewConfirmedAppointmentEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMasterTelegramNewConfirmedAppointment } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type ConfirmAppointmentPageProps = {
  params: Promise<{ token: string }>;
};

type AppointmentRow = {
  id: number | string;
  master_slug: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
  cancel_token: string;
  status: string | null;
  confirm_expires_at: string | null;
  master_timezone?: string | null;
};

async function confirmAppointment(token: string) {
  const { data: appointment, error: appointmentError } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, master_slug, service_name, appointment_date, appointment_time, client_name, client_phone, client_email, client_note, cancel_token, status, confirm_expires_at"
    )
    .eq("confirm_token", token)
    .maybeSingle();

  if (appointmentError) {
    console.error("confirm appointment read error:", appointmentError);
    return { status: "error" as const, appointment: null };
  }

  if (!appointment) {
    return { status: "invalid" as const, appointment: null };
  }

  const row = appointment as AppointmentRow;

  if (row.status === "active") {
    return { status: "already-confirmed" as const, appointment: row };
  }

  if (row.status === "cancelled") {
    return { status: "cancelled" as const, appointment: row };
  }

  const expiresAt = row.confirm_expires_at
    ? new Date(row.confirm_expires_at).getTime()
    : 0;

  if (!expiresAt || expiresAt < Date.now()) {
    return { status: "expired" as const, appointment: row };
  }

  if (row.status !== "pending_confirmation") {
    return { status: "invalid" as const, appointment: row };
  }

  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select("name, booking_email, timezone")
    .eq("slug", row.master_slug)
    .single();

  if (masterError || !master) {
    console.error("confirm appointment master read error:", masterError);
    return { status: "error" as const, appointment: row };
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("appointments")
    .update({
      status: "active",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "pending_confirmation")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("confirm appointment update error:", updateError);
    return { status: "error" as const, appointment: row };
  }

  if (!updated) {
    return { status: "already-confirmed" as const, appointment: row };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cancelUrl = `${siteUrl}/cancel/${row.cancel_token}`;

  try {
    await sendMasterNewConfirmedAppointmentEmail({
      masterName: master.name,
      masterEmail: master.booking_email,
      clientName: row.client_name,
      clientPhone: row.client_phone || "-",
      clientEmail: row.client_email,
      serviceName: row.service_name,
      clientNote: row.client_note,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      timeZone: master.timezone,
      cancelUrl,
    });
  } catch (emailError) {
    console.error("confirm appointment master email failed:", emailError);
  }

  try {
    await sendMasterTelegramNewConfirmedAppointment({
      masterSlug: row.master_slug,
      masterName: master.name,
      clientName: row.client_name,
      clientPhone: row.client_phone || "-",
      clientEmail: row.client_email,
      serviceName: row.service_name,
      clientNote: row.client_note,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      timeZone: master.timezone,
    });
  } catch (telegramError) {
    console.error("confirm appointment telegram notification failed:", telegramError);
  }

  return { status: "confirmed" as const, appointment: row };
}

export default async function ConfirmAppointmentPage({
  params,
}: ConfirmAppointmentPageProps) {
  const { token } = await params;
  const result = await confirmAppointment(token);

  const titleByStatus = {
    confirmed: "Appointment confirmed",
    "already-confirmed": "Appointment already confirmed",
    cancelled: "Appointment cancelled",
    expired: "Confirmation link expired",
    invalid: "Invalid confirmation link",
    error: "Could not confirm appointment",
  } as const;

  const textByStatus = {
    confirmed:
      "Thank you. Your appointment has been confirmed. The master has been notified.",
    "already-confirmed": "This appointment has already been confirmed.",
    cancelled: "This appointment has already been cancelled.",
    expired:
      "This confirmation link has expired. Please go back to the master's page and book a new time slot.",
    invalid: "This confirmation link is invalid or no longer available.",
    error: "Something went wrong. Please try again later.",
  } as const;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {titleByStatus[result.status]}
          </h1>

          <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
            <p className="text-neutral-700">{textByStatus[result.status]}</p>

            {result.appointment && (
              <div className="mt-6 space-y-2 text-sm text-neutral-700">
                <p>
                  <strong>Service:</strong> {result.appointment.service_name}
                </p>
                <p>
                  <strong>Date:</strong> {result.appointment.appointment_date}
                </p>
                <p>
                  <strong>Time:</strong> {result.appointment.appointment_time}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {result.appointment && (
                <Link
                  href={`/${result.appointment.master_slug}`}
                  className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Open master page
                </Link>
              )}

              {result.appointment && result.status !== "cancelled" && (
                <Link
                  href={`/cancel/${result.appointment.cancel_token}`}
                  className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  Cancel appointment
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
