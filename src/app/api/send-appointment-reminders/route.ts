import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendAppointmentReminderEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeTimeZone, zonedDateTimeToUtcDate } from "@/lib/timezones";

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_BEFORE_MINUTES = 24 * 60 + 20;
const REMINDER_WINDOW_AFTER_MINUTES = 24 * 60 - 20;

// Query up to 3 days ahead so time zones near the date boundary are covered.
const REMINDER_LOOKAHEAD_DAYS = 3;

type ReminderAppointmentRow = {
  id: number | string;
  master_slug: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_email: string;
  cancel_token: string;
};

type MasterRow = {
  slug: string;
  name: string;
  timezone: string | null;
  booking_policy_text: string | null;
};

function timingSafeEqualString(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("Missing CRON_SECRET environment variable.");
    return false;
  }

  const bearerToken = getBearerToken(request);

  if (bearerToken && timingSafeEqualString(bearerToken, cronSecret)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    const { searchParams } = new URL(request.url);
    const secretFromQuery = searchParams.get("secret") || "";

    if (secretFromQuery && timingSafeEqualString(secretFromQuery, cronSecret)) {
      return true;
    }
  }

  return false;
}

function getDateString(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function normalizeAppointmentTime(timeString: string) {
  const trimmed = String(timeString || "").trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{1}:\d{2}$/.test(trimmed)) {
    return `0${trimmed}`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }

  return trimmed;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const today = getDateString(now);
  const maxDate = getDateString(addDays(now, REMINDER_LOOKAHEAD_DAYS));

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, master_slug, service_name, appointment_date, appointment_time, client_name, client_email, cancel_token"
    )
    .eq("status", "active")
    .is("reminder_sent_at", null)
    .gte("appointment_date", today)
    .lte("appointment_date", maxDate);

  if (error) {
    console.error("send reminders query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as ReminderAppointmentRow[];

  const masterSlugs = Array.from(
    new Set(rows.map((appointment) => appointment.master_slug))
  );

  let masterBySlug = new Map<string, MasterRow>();

  if (masterSlugs.length > 0) {
    const { data: masters, error: mastersError } = await supabaseAdmin
      .from("masters")
      .select("slug, name, timezone, booking_policy_text")
      .in("slug", masterSlugs);

    if (mastersError) {
      console.error("send reminders masters query error:", mastersError);
    }

    masterBySlug = new Map(
      ((masters || []) as MasterRow[]).map((master) => [master.slug, master])
    );
  }

  const appointmentsToRemind = rows.filter((appointment) => {
    const master = masterBySlug.get(appointment.master_slug);
    const timeZone = normalizeTimeZone(master?.timezone);

    const appointmentAt = zonedDateTimeToUtcDate(
      appointment.appointment_date,
      appointment.appointment_time,
      timeZone
    );

    if (Number.isNaN(appointmentAt.getTime())) {
      console.error("Invalid appointment date/time:", {
        id: appointment.id,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        timeZone,
      });

      return false;
    }

    const minutesUntilAppointment =
      (appointmentAt.getTime() - now.getTime()) / (60 * 1000);

    return (
      minutesUntilAppointment <= REMINDER_WINDOW_BEFORE_MINUTES &&
      minutesUntilAppointment >= REMINDER_WINDOW_AFTER_MINUTES
    );
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  let sent = 0;
  const failed: Array<string | number> = [];

  for (const appointment of appointmentsToRemind) {
    const master = masterBySlug.get(appointment.master_slug);
    const masterName = master?.name || appointment.master_slug;
    const timeZone = normalizeTimeZone(master?.timezone);
    const cancelUrl = `${siteUrl}/cancel/${appointment.cancel_token}`;

    try {
      await sendAppointmentReminderEmail({
        to: appointment.client_email,
        clientName: appointment.client_name,
        masterName,
        serviceName: appointment.service_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: normalizeAppointmentTime(appointment.appointment_time),
        timeZone,
        bookingPolicyText: master?.booking_policy_text || null,
        cancelUrl,
      });

      const { error: updateError } = await supabaseAdmin
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appointment.id)
        .eq("status", "active")
        .is("reminder_sent_at", null);

      if (updateError) {
        console.error("send reminders update error:", updateError);
        failed.push(appointment.id);
      } else {
        sent += 1;
      }
    } catch (emailError) {
      console.error("send reminder email failed:", emailError);
      failed.push(appointment.id);
    }
  }

  return NextResponse.json({
    checked: rows.length,
    eligible: appointmentsToRemind.length,
    sent,
    failed,
  });
}
