import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingEmails } from "@/lib/email";
import { canAcceptBookings } from "@/lib/subscription";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

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

function getDurationFromService(duration: string | number | null | undefined) {
  if (typeof duration === "number" && !Number.isNaN(duration)) {
    return duration;
  }

  if (!duration) return 60;

  const match = String(duration).match(/\d+/);
  return match ? Number(match[0]) : 60;
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
  try {
    const body = await readBookingPayload(request);

    const turnstileToken = getString(
      body.turnstileToken ||
        body.turnstile_token ||
        body["cf-turnstile-response"]
    );

    const turnstilePassed = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: getClientIp(request),
    });

    if (!turnstilePassed) {
      return NextResponse.json(
        {
          error: "Security check failed. Please refresh the page and try again.",
        },
        { status: 403 }
      );
    }

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

    const newStart = timeToMinutes(appointmentTime);

    if (newStart === null) {
      return NextResponse.json(
        { error: "Invalid appointment time." },
        { status: 400 }
      );
    }

    const { data: master, error: masterError } = await supabaseAdmin
      .from("masters")
      .select("slug, name, booking_email")
      .eq("slug", masterSlug)
      .single();

    if (masterError || !master) {
      return NextResponse.json(
        { error: "Master not found." },
        { status: 404 }
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
      .select("name, duration_minutes")
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
    const newEnd = newStart + newDuration;

    const { data: existingAppointments, error: existingError } =
      await supabaseAdmin
        .from("appointments")
        .select("appointment_time, service_name")
        .eq("master_slug", masterSlug)
        .eq("appointment_date", appointmentDate)
        .neq("status", "cancelled");

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

    const serviceNames = Array.from(
      new Set((existingAppointments || []).map((item) => item.service_name))
    );

    let serviceDurations = new Map<string, number>();

    if (serviceNames.length > 0) {
      const { data: durationRows, error: durationError } = await supabaseAdmin
        .from("master_services")
        .select("name, duration_minutes")
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

    const hasConflict = (existingAppointments || []).some((appointment) => {
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

    const { error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert([
        {
          master_slug: masterSlug,
          service_name: serviceName,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          client_name: clientName,
          client_phone: clientPhone || null,
          client_email: clientEmail,
          cancel_token: cancelToken,
          status: "active",
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

    try {
      await sendBookingEmails({
        masterName: master.name,
        masterEmail: master.booking_email,
        clientName,
        clientPhone: clientPhone || "-",
        clientEmail,
        serviceName,
        appointmentDate,
        appointmentTime,
        cancelUrl,
      });
    } catch (emailError) {
      console.error("book-appointment email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("book-appointment unexpected error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}