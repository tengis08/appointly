import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

type BookingPayload = {
  masterSlug: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getDurationFromService(duration: string | number | null | undefined) {
  if (typeof duration === "number") return duration;
  if (!duration) return 60;

  const match = String(duration).match(/\d+/);
  return match ? Number(match[0]) : 60;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;

    const masterSlug = body.masterSlug?.trim();
    const serviceName = body.serviceName?.trim();
    const appointmentDate = body.appointmentDate?.trim();
    const appointmentTime = body.appointmentTime?.trim();
    const clientName = body.clientName?.trim();
    const clientPhone = body.clientPhone?.trim();
    const clientEmail = body.clientEmail?.trim().toLowerCase();

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

    const newStart = timeToMinutes(appointmentTime);
    const newDuration = getDurationFromService(service.duration_minutes);
    const newEnd = newStart + newDuration;

    const { data: existingAppointments, error: existingError } =
      await supabaseAdmin
        .from("appointments")
        .select("appointment_time, service_name")
        .eq("master_slug", masterSlug)
        .eq("appointment_date", appointmentDate)
        .eq("status", "active");

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
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
        return NextResponse.json(
          { error: durationError.message },
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
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const cancelUrl = `${siteUrl}/cancel/${cancelToken}`;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("book-appointment error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}