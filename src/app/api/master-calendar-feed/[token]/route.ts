import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeTimeZone } from "@/lib/timezones";

export const dynamic = "force-dynamic";

type FeedRouteContext = {
  params: Promise<{ token: string }>;
};

type AppointmentRow = {
  id: number | string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
};

type ServiceRow = {
  name: string;
  duration_minutes: number | null;
};

type MasterAccountRow = {
  master_slug: string;
  plan_type: string | null;
  subscription_status: string | null;
};

function isPremiumAccount(planType: string | null, subscriptionStatus: string | null) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

function cleanToken(value: string) {
  return String(value || "").replace(/\.ics$/i, "").trim();
}

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeTime(time: string) {
  const trimmed = String(time || "").trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{1}:\d{2}$/.test(trimmed)) return `0${trimmed}`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);

  return trimmed;
}

function addMinutesToDateTime(dateString: string, timeString: string, minutes: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, mins] = normalizeTime(timeString).split(":").map(Number);

  const totalMinutes = hours * 60 + mins + minutes;
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const minutesInDay = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

  const nextDate = new Date(year, month - 1, day + dayOffset);
  const nextHours = Math.floor(minutesInDay / 60);
  const nextMinutes = minutesInDay % 60;

  return {
    date: formatDateString(nextDate),
    time: `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`,
  };
}

function toIcsDateTime(dateString: string, timeString: string) {
  return `${dateString.replaceAll("-", "")}T${normalizeTime(timeString).replace(":", "")}00`;
}

function toUtcIcsDateTime(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: unknown) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function makeDescription(appointment: AppointmentRow) {
  const lines = [
    `Service: ${appointment.service_name}`,
    `Client: ${appointment.client_name}`,
    `Phone: ${appointment.client_phone || ""}`,
    `Email: ${appointment.client_email || ""}`,
  ];

  if (appointment.client_note) {
    lines.push(`Comment: ${appointment.client_note}`);
  }

  return lines.join("\n");
}

function buildIcs(params: {
  masterName: string;
  masterSlug: string;
  masterTimeZone: string;
  masterAddress: string | null;
  appointments: AppointmentRow[];
  durationByServiceName: Map<string, number>;
}) {
  const now = toUtcIcsDateTime(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Appointly//Live Calendar Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`Appointly - ${params.masterName}`)}`,
    `X-WR-TIMEZONE:${escapeIcsText(params.masterTimeZone)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const appointment of params.appointments) {
    const duration = params.durationByServiceName.get(appointment.service_name) || 60;
    const end = addMinutesToDateTime(
      appointment.appointment_date,
      appointment.appointment_time,
      duration
    );

    lines.push(
      "BEGIN:VEVENT",
      `UID:appointly-${params.masterSlug}-${appointment.id}@appointly.vip`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=${params.masterTimeZone}:${toIcsDateTime(
        appointment.appointment_date,
        appointment.appointment_time
      )}`,
      `DTEND;TZID=${params.masterTimeZone}:${toIcsDateTime(end.date, end.time)}`,
      `SUMMARY:${escapeIcsText(`${appointment.service_name} - ${appointment.client_name}`)}`,
      `DESCRIPTION:${escapeIcsText(makeDescription(appointment))}`,
      params.masterAddress ? `LOCATION:${escapeIcsText(params.masterAddress)}` : "",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return `${lines.filter(Boolean).join("\r\n")}\r\n`;
}

export async function GET(_request: Request, context: FeedRouteContext) {
  const { token } = await context.params;
  const calendarToken = cleanToken(token);

  if (!calendarToken || calendarToken.length < 32) {
    return NextResponse.json({ error: "Invalid calendar feed token." }, { status: 404 });
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug, plan_type, subscription_status")
    .eq("calendar_feed_token", calendarToken)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  const masterAccount = account as MasterAccountRow | null;

  if (
    !masterAccount ||
    !isPremiumAccount(masterAccount.plan_type, masterAccount.subscription_status)
  ) {
    return NextResponse.json({ error: "Calendar feed not found." }, { status: 404 });
  }

  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, address, timezone")
    .eq("slug", masterAccount.master_slug)
    .maybeSingle();

  if (masterError || !master) {
    return NextResponse.json({ error: "Master not found." }, { status: 404 });
  }

  const now = new Date();
  const startDate = formatDateString(addDays(now, -30));
  const endDate = formatDateString(addDays(now, 365));

  const { data: appointments, error: appointmentsError } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, service_name, client_name, client_phone, client_email, client_note"
    )
    .eq("master_slug", masterAccount.master_slug)
    .eq("status", "active")
    .gte("appointment_date", startDate)
    .lte("appointment_date", endDate)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (appointmentsError) {
    return NextResponse.json({ error: appointmentsError.message }, { status: 500 });
  }

  const { data: services, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("name, duration_minutes")
    .eq("master_slug", masterAccount.master_slug);

  if (servicesError) {
    return NextResponse.json({ error: servicesError.message }, { status: 500 });
  }

  const durationByServiceName = new Map(
    ((services || []) as ServiceRow[]).map((service) => [
      service.name,
      service.duration_minutes || 60,
    ])
  );

  const masterTimeZone = normalizeTimeZone(master.timezone);
  const ics = buildIcs({
    masterName: master.name,
    masterSlug: master.slug,
    masterTimeZone,
    masterAddress: master.address,
    appointments: (appointments || []) as AppointmentRow[],
    durationByServiceName,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="appointly-${master.slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
