import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMasterTelegramCancelledAppointment } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type AppointmentToCancel = {
  id: number | string;
  master_slug: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  status: string | null;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "Cancel token is required." },
      { status: 400 }
    );
  }

  const { data: existingAppointment, error: readError } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, master_slug, service_name, appointment_date, appointment_time, client_name, client_phone, client_email, status"
    )
    .eq("cancel_token", token)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const appointment = existingAppointment as AppointmentToCancel | null;

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("cancel_token", token)
    .in("status", ["active", "pending_confirmation"])
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data && appointment?.status === "active") {
    try {
      const { data: master } = await supabaseAdmin
        .from("masters")
        .select("name, timezone")
        .eq("slug", appointment.master_slug)
        .maybeSingle();

      await sendMasterTelegramCancelledAppointment({
        masterSlug: appointment.master_slug,
        masterName: master?.name || appointment.master_slug,
        clientName: appointment.client_name,
        clientPhone: appointment.client_phone,
        clientEmail: appointment.client_email,
        serviceName: appointment.service_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        timeZone: master?.timezone || null,
      });
    } catch (telegramError) {
      console.error("cancel appointment telegram notification failed:", telegramError);
    }
  }

  return NextResponse.redirect(
    new URL(`/cancel/${token}?cancelled=1`, request.url),
    { status: 303 }
  );
}
