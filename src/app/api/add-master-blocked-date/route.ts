import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendMasterCancelledAppointmentEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function verifyMasterAccess(slug: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return { ok: false, status: 401, error: "Not logged in." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return { ok: false, status: 401, error: "Invalid login session." };
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug")
    .eq("user_id", user.id)
    .single();

  if (accountError || !account || account.master_slug !== slug) {
    return { ok: false, status: 403, error: "You do not have access." };
  }

  return { ok: true, status: 200, error: "" };
}

type AppointmentToCancel = {
  id: string | number;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_email: string;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const slug = String(formData.get("slug") || "").trim();
    const blockedDate = String(formData.get("blockedDate") || "").trim();
    const reason = String(formData.get("reason") || "").trim();

    if (!slug || !blockedDate || !isValidDateString(blockedDate)) {
      return NextResponse.json(
        { error: "Slug and valid blocked date are required." },
        { status: 400 }
      );
    }

    const access = await verifyMasterAccess(slug);

    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const { data: master, error: masterError } = await supabaseAdmin
      .from("masters")
      .select("slug, name")
      .eq("slug", slug)
      .single();

    if (masterError || !master) {
      return NextResponse.json(
        { error: "Master not found." },
        { status: 404 }
      );
    }

    const { error: blockedDateError } = await supabaseAdmin
      .from("master_blocked_dates")
      .upsert(
        {
          master_slug: slug,
          blocked_date: blockedDate,
          reason: reason || null,
        },
        {
          onConflict: "master_slug,blocked_date",
        }
      );

    if (blockedDateError) {
      return NextResponse.json(
        { error: blockedDateError.message },
        { status: 500 }
      );
    }

    const { data: activeAppointments, error: activeAppointmentsError } =
      await supabaseAdmin
        .from("appointments")
        .select(
          "id, service_name, appointment_date, appointment_time, client_name, client_email"
        )
        .eq("master_slug", slug)
        .eq("appointment_date", blockedDate)
        .in("status", ["active", "pending_confirmation"]);

    if (activeAppointmentsError) {
      return NextResponse.json(
        { error: activeAppointmentsError.message },
        { status: 500 }
      );
    }

    const appointmentsToCancel =
      (activeAppointments || []) as AppointmentToCancel[];

    if (appointmentsToCancel.length > 0) {
      const appointmentIds = appointmentsToCancel.map((appointment) => appointment.id);

      const { error: cancelError } = await supabaseAdmin
        .from("appointments")
        .update({ status: "cancelled" })
        .in("id", appointmentIds)
        .eq("master_slug", slug)
        .eq("appointment_date", blockedDate)
        .in("status", ["active", "pending_confirmation"]);

      if (cancelError) {
        return NextResponse.json(
          { error: cancelError.message },
          { status: 500 }
        );
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

      const publicPageUrl = `${siteUrl}/${slug}`;

      for (const appointment of appointmentsToCancel) {
        try {
          await sendMasterCancelledAppointmentEmail({
            to: appointment.client_email,
            clientName: appointment.client_name,
            masterName: master.name,
            serviceName: appointment.service_name,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            publicPageUrl,
            reason: reason || null,
          });
        } catch (emailError) {
          console.error(
            "add-master-blocked-date cancellation email failed:",
            emailError
          );
        }
      }
    }

    const redirectUrl = new URL(
      `/dashboard/${slug}/availability?saved=1`,
      request.url
    );

    if (appointmentsToCancel.length > 0) {
      redirectUrl.searchParams.set(
        "cancelled",
        String(appointmentsToCancel.length)
      );
    }

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("add-master-blocked-date unexpected error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}