import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { canAcceptBookings } from "@/lib/subscription";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";
import {
  checkRateLimit,
  cleanupOldRateLimitRows,
  normalizeRateLimitValue,
} from "@/lib/rate-limit";
import {
  addDaysToDateString,
  getCurrentMinutesInTimeZone,
  getDateStringInTimeZone,
  normalizeTimeZone,
} from "@/lib/timezones";

export const dynamic = "force-dynamic";

const CONFIRMATION_EXPIRES_MINUTES = 60;

type BookingPayload = {
  masterSlug?: string;
  master_slug?: string;
  serviceName?: string;
  service_name?: string;
  appointmentDate?: string;
  appointment_date?: string;
  appointmentTime?: string;
  appointment_time?: string;
  clientName?: string;
  client_name?: string;
  clientPhone?: string;
  client_phone?: string;
  clientEmail?: string;
  client_email?: string;
  clientNote?: string;
  client_note?: string;
  turnstileToken?: string;
  turnstile_token?: string;
  "cf-turnstile-response"?: string;
};

function getString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeTime(time: string) {
  if (!time) return "";

  const trimmed = time.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{1}:\d{2}$/.test(trimmed)) {
    return `0${trimmed}`;
  }

  return trimmed;
}

function timeToMinutes(time: string) {
  const normalized = normalizeTime(time);
  const [hours, minutes] = normalized.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function parseServicePrice(price: string | number | null | undefined) {
  if (typeof price === "number" && Number.isFinite(price)) {
    return Math.round(price * 100) / 100;
  }

  if (!price) {
    return null;
  }

  const normalized = String(price)
    .replace(/[^0-9.,-]/g, "")
    .replace(",", ".");

  const value = Number(normalized);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value * 100) / 100;
}

function getDurationFromService(duration: string | number | null | undefined) {
  if (typeof duration === "number" && !Number.isNaN(duration)) {
    return duration;
  }

  if (!duration) return 60;

  const match = String(duration).match(/\d+/);
  return match ? Number(match[0]) : 60;
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

async function readBookingPayload(request: Request): Promise<BookingPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as BookingPayload;
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const formData = await request.formData();

    const payload: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        payload[key] = value;
      }
    }

    return payload;
  }

  return {};
}

export async function POST(request: Request) {
  let insertedCancelToken: string | null = null;

  try {
    const body = await readBookingPayload(request);

    const clientIp = getClientIp(request) || "unknown-ip";

    const masterSlug = getString(body.masterSlug || body.master_slug);
    const serviceName = getString(body.serviceName || body.service_name);

    const appointmentDate = getString(
      body.appointmentDate || body.appointment_date
    );

    const appointmentTime = normalizeTime(
      getString(body.appointmentTime || body.appointment_time)
    );

    const clientName = getString(body.clientName || body.client_name);
    const clientPhone = getString(body.clientPhone || body.client_phone);

    const clientEmail = getString(
      body.clientEmail || body.client_email
    ).toLowerCase();

    const clientNote = getString(body.clientNote || body.client_note).slice(
      0,
      400
    );

    if (
      !masterSlug ||
      !serviceName ||
      !appointmentDate ||
      !appointmentTime ||
      !clientName ||
      !clientEmail
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields." },
        { status: 400 }
      );
    }

    const ipRateLimit = await checkRateLimit({
      key: `booking:ip:${normalizeRateLimitValue(clientIp)}`,
      limit: 5,
      windowSeconds: 60 * 60,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many booking attempts from this connection. Please try again later.",
        },
        { status: 429 }
      );
    }

    const masterRateLimit = await checkRateLimit({
      key: `booking:master:${normalizeRateLimitValue(masterSlug)}`,
      limit: 100,
      windowSeconds: 60 * 60,
    });

    if (!masterRateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "This master is receiving too many booking requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    cleanupOldRateLimitRows().catch((error) => {
      console.error("book-appointment rate limit cleanup failed:", error);
    });

    const turnstileToken = getString(
      body.turnstileToken ||
        body.turnstile_token ||
        body["cf-turnstile-response"]
    );

    const turnstilePassed = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: clientIp,
    });

    if (!turnstilePassed) {
      return NextResponse.json(
        {
          error: "Security check failed. Please refresh the page and try again.",
        },
        { status: 403 }
      );
    }

    const newStart = timeToMinutes(appointmentTime);

    if (newStart === null) {
      return NextResponse.json(
        { error: "Invalid appointment time." },
        { status: 400 }
      );
    }

    const { data: master, error: masterError } = await supabaseAdmin
      .from("masters")
      .select("slug, name, booking_email, booking_window_days, timezone, booking_policy_text")
      .eq("slug", masterSlug)
      .single();

    if (masterError || !master) {
      return NextResponse.json(
        { error: "Master not found." },
        { status: 404 }
      );
    }

    const masterTimeZone = normalizeTimeZone(master.timezone);
    const bookingWindowDays = normalizeBookingWindowDays(
      master.booking_window_days
    );

    if (!isDateInsideBookingWindow(appointmentDate, bookingWindowDays, masterTimeZone)) {
      return NextResponse.json(
        {
          error: "This date is outside the master's current booking window.",
        },
        { status: 400 }
      );
    }

    const todayInMasterTimeZone = getDateStringInTimeZone(new Date(), masterTimeZone);
    const currentMinutesInMasterTimeZone = getCurrentMinutesInTimeZone(masterTimeZone);

    if (
      appointmentDate === todayInMasterTimeZone &&
      newStart <= currentMinutesInMasterTimeZone
    ) {
      return NextResponse.json(
        { error: "This time slot is no longer available." },
        { status: 400 }
      );
    }

    const { data: blockedDate } = await supabaseAdmin
      .from("master_blocked_dates")
      .select("blocked_date")
      .eq("master_slug", masterSlug)
      .eq("blocked_date", appointmentDate)
      .maybeSingle();

    if (blockedDate) {
      return NextResponse.json(
        {
          error:
            "This date is not available for booking. Please choose another date.",
        },
        { status: 400 }
      );
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .select("plan_type, subscription_status")
      .eq("master_slug", masterSlug)
      .maybeSingle();

    if (accountError) {
      console.error("book-appointment account error:", accountError);

      return NextResponse.json(
        { error: "Could not verify subscription status." },
        { status: 500 }
      );
    }

    const allowedToAcceptBookings = canAcceptBookings({
      planType: account?.plan_type,
      subscriptionStatus: account?.subscription_status,
    });

    if (!allowedToAcceptBookings) {
      return NextResponse.json(
        {
          error:
            "Online booking is currently unavailable for this master. Please contact the master directly.",
        },
        { status: 403 }
      );
    }

    const { data: service, error: serviceError } = await supabaseAdmin
      .from("master_services")
      .select("name, price, duration_minutes")
      .eq("master_slug", masterSlug)
      .eq("name", serviceName)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const newDuration = getDurationFromService(service.duration_minutes);
    const servicePriceAtBooking = parseServicePrice(service.price);
    const newEnd = newStart + newDuration;

    const { data: existingAppointments, error: existingError } =
      await supabaseAdmin
        .from("appointments")
        .select("appointment_time, service_name, status, confirm_expires_at")
        .eq("master_slug", masterSlug)
        .eq("appointment_date", appointmentDate);

    if (existingError) {
      console.error(
        "book-appointment existing appointments error:",
        existingError
      );

      return NextResponse.json(
        { error: "Could not check existing appointments." },
        { status: 500 }
      );
    }

    const blockingAppointments = (existingAppointments || []).filter((item) =>
      appointmentBlocksSlot(item.status, item.confirm_expires_at)
    );

    const serviceNames = Array.from(
      new Set(blockingAppointments.map((item) => item.service_name))
    );

    let serviceDurations = new Map<string, number>();

    if (serviceNames.length > 0) {
      const { data: durationRows, error: durationError } = await supabaseAdmin
        .from("master_services")
        .select("name, price, duration_minutes")
        .eq("master_slug", masterSlug)
        .in("name", serviceNames);

      if (durationError) {
        console.error("book-appointment duration rows error:", durationError);

        return NextResponse.json(
          { error: "Could not check service durations." },
          { status: 500 }
        );
      }

      serviceDurations = new Map(
        (durationRows || []).map((row) => [
          row.name,
          getDurationFromService(row.duration_minutes),
        ])
      );
    }

    const hasConflict = blockingAppointments.some((appointment) => {
      const existingStart = timeToMinutes(appointment.appointment_time);

      if (existingStart === null) {
        return false;
      }

      const existingDuration =
        serviceDurations.get(appointment.service_name) || 60;

      const existingEnd = existingStart + existingDuration;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "This time slot is no longer available." },
        { status: 409 }
      );
    }

    const cancelToken = crypto.randomUUID();
    const confirmToken = crypto.randomUUID();
    const confirmExpiresAt = new Date(
      Date.now() + CONFIRMATION_EXPIRES_MINUTES * 60 * 1000
    ).toISOString();

    insertedCancelToken = cancelToken;

    const { error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert([
        {
          master_slug: masterSlug,
          service_name: serviceName,
          service_price_at_booking: servicePriceAtBooking,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          client_name: clientName,
          client_phone: clientPhone || null,
          client_email: clientEmail,
          client_note: clientNote || null,
          cancel_token: cancelToken,
          confirm_token: confirmToken,
          confirm_expires_at: confirmExpiresAt,
          status: "pending_confirmation",
        },
      ]);

    if (insertError) {
      console.error("book-appointment insert error:", insertError);

      return NextResponse.json(
        { error: "Could not create appointment." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const cancelUrl = `${siteUrl}/cancel/${cancelToken}`;
    const confirmUrl = `${siteUrl}/confirm/${confirmToken}`;

    try {
      await sendBookingConfirmationEmail({
        masterName: master.name,
        clientName,
        clientEmail,
        serviceName,
        clientNote: clientNote || null,
        appointmentDate,
        appointmentTime,
        timeZone: masterTimeZone,
        bookingPolicyText: master.booking_policy_text || null,
        confirmUrl,
        cancelUrl,
      });
    } catch (emailError) {
      console.error("book-appointment confirmation email error:", emailError);

      await supabaseAdmin
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("cancel_token", cancelToken)
        .eq("status", "pending_confirmation");

      return NextResponse.json(
        { error: "Could not send confirmation email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresConfirmation: true,
    });
  } catch (error) {
    console.error("book-appointment unexpected error:", error);

    if (insertedCancelToken) {
      await supabaseAdmin
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("cancel_token", insertedCancelToken)
        .eq("status", "pending_confirmation");
    }

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
