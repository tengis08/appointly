import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  addDaysToDateString,
  getCurrentMinutesInTimeZone,
  getDateStringInTimeZone,
  getDayOfWeekFromDateString,
  normalizeTimeZone,
} from "@/lib/timezones";

export const dynamic = "force-dynamic";

function normalizeTime(time: string) {
  const trimmed = String(time || "").trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{1}:\d{2}$/.test(trimmed)) return `0${trimmed}`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);

  return trimmed;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function normalizeBookingWindowDays(value: number | null | undefined) {
  if (value === 14 || value === 21 || value === 30 || value === 60 || value === 90) {
    return value;
  }

  return 30;
}

function isDateInsideBookingWindow(
  dateString: string,
  bookingWindowDays: number,
  timeZone: string
) {
  const today = getDateStringInTimeZone(new Date(), timeZone);
  const maxDate = addDaysToDateString(today, bookingWindowDays);

  return dateString >= today && dateString <= maxDate;
}

function appointmentBlocksSlot(status: string | null, confirmExpiresAt?: string | null) {
  if (status === "active") return true;

  if (status === "pending_confirmation") {
    if (!confirmExpiresAt) return false;
    return new Date(confirmExpiresAt).getTime() > Date.now();
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const masterSlug = searchParams.get("masterSlug")?.trim();
  const date = searchParams.get("date")?.trim();
  const serviceName = searchParams.get("serviceName")?.trim();

  if (!masterSlug || !date || !serviceName) {
    return NextResponse.json(
      { error: "masterSlug, date, and serviceName are required.", slots: [] },
      { status: 400 }
    );
  }

  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select("slot_step_minutes, booking_window_days, timezone")
    .eq("slug", masterSlug)
    .single();

  if (masterError || !master) {
    return NextResponse.json({ slots: [] });
  }

  const masterTimeZone = normalizeTimeZone(master.timezone);
  const bookingWindowDays = normalizeBookingWindowDays(
    master.booking_window_days
  );

  if (!isDateInsideBookingWindow(date, bookingWindowDays, masterTimeZone)) {
    return NextResponse.json({ slots: [] });
  }

  const { data: blockedDate } = await supabaseAdmin
    .from("master_blocked_dates")
    .select("blocked_date")
    .eq("master_slug", masterSlug)
    .eq("blocked_date", date)
    .maybeSingle();

  if (blockedDate) {
    return NextResponse.json({ slots: [] });
  }

  const { data: service, error: serviceError } = await supabaseAdmin
    .from("master_services")
    .select("duration_minutes")
    .eq("master_slug", masterSlug)
    .eq("name", serviceName)
    .single();

  if (serviceError || !service) {
    return NextResponse.json({ slots: [] });
  }

  const dayOfWeek = getDayOfWeekFromDateString(date);

  const { data: workingDay, error: workingDayError } = await supabaseAdmin
    .from("master_working_days")
    .select("start_time, end_time")
    .eq("master_slug", masterSlug)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  if (workingDayError || !workingDay) {
    return NextResponse.json({ slots: [] });
  }

  const startMinutes = timeToMinutes(workingDay.start_time);
  const endMinutes = timeToMinutes(workingDay.end_time);
  const serviceDuration = service.duration_minutes;
  const slotStep = master.slot_step_minutes || 30;

  const { data: appointments, error: appointmentsError } = await supabaseAdmin
    .from("appointments")
    .select("appointment_time, service_name, status, confirm_expires_at")
    .eq("master_slug", masterSlug)
    .eq("appointment_date", date);

  if (appointmentsError) {
    return NextResponse.json(
      { error: appointmentsError.message, slots: [] },
      { status: 500 }
    );
  }

  const blockingAppointments = (appointments || []).filter((appointment) =>
    appointmentBlocksSlot(appointment.status, appointment.confirm_expires_at)
  );

  const serviceNames = Array.from(
    new Set(blockingAppointments.map((item) => item.service_name))
  );

  let durationMap = new Map<string, number>();

  if (serviceNames.length > 0) {
    const { data: services } = await supabaseAdmin
      .from("master_services")
      .select("name, duration_minutes")
      .eq("master_slug", masterSlug)
      .in("name", serviceNames);

    durationMap = new Map(
      (services || []).map((item) => [item.name, item.duration_minutes])
    );
  }

  const busyIntervals = blockingAppointments.map((appointment) => {
    const busyStart = timeToMinutes(appointment.appointment_time);
    const busyDuration = durationMap.get(appointment.service_name) || 60;
    const busyEnd = busyStart + busyDuration;

    return {
      start: busyStart,
      end: busyEnd,
    };
  });

  const todayInMasterTimeZone = getDateStringInTimeZone(new Date(), masterTimeZone);
  const currentMinutes = getCurrentMinutesInTimeZone(masterTimeZone);
  const slots: string[] = [];

  for (
    let slotStart = startMinutes;
    slotStart + serviceDuration <= endMinutes;
    slotStart += slotStep
  ) {
    if (date === todayInMasterTimeZone && slotStart <= currentMinutes) {
      continue;
    }

    const slotEnd = slotStart + serviceDuration;

    const hasConflict = busyIntervals.some((busy) => {
      return slotStart < busy.end && slotEnd > busy.start;
    });

    if (!hasConflict) {
      slots.push(minutesToTime(slotStart));
    }
  }

  return NextResponse.json({ slots });
}
