import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getAnalyticsDateRange,
  normalizeAnalyticsPeriod,
  normalizeDateInput,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

type AppointmentRow = {
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
  status: string | null;
  service_price_at_booking: number | string | null;
};

type ServiceRow = {
  name: string;
  category: string | null;
};

function isPremiumAccount(
  planType: string | null,
  subscriptionStatus: string | null
) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function buildCsv(params: {
  rows: AppointmentRow[];
  categoryByServiceName: Map<string, string>;
}) {
  const headers = [
    "date",
    "time",
    "service_category",
    "service",
    "client_name",
    "client_phone",
    "client_email",
    "status",
    "client_comment",
    "estimated_price",
  ];

  const lines = [headers.map(csvEscape).join(",")];

  for (const row of params.rows) {
    lines.push(
      [
        row.appointment_date,
        row.appointment_time,
        params.categoryByServiceName.get(row.service_name) || "Uncategorized",
        row.service_name,
        row.client_name,
        row.client_phone || "",
        row.client_email,
        row.status || "",
        row.client_note || "",
        row.service_price_at_booking ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return lines.join("\n");
}

async function getLoggedMasterAccount() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug, plan_type, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError || !account) {
    return null;
  }

  return account;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = String(searchParams.get("slug") || "").trim();
  const period = normalizeAnalyticsPeriod(searchParams.get("period"));
  const startDate = normalizeDateInput(searchParams.get("startDate"));
  const endDate = normalizeDateInput(searchParams.get("endDate"));
  const dateRange = getAnalyticsDateRange({ period, startDate, endDate });

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const account = await getLoggedMasterAccount();

  if (!account || account.master_slug !== slug) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (!isPremiumAccount(account.plan_type, account.subscription_status)) {
    return NextResponse.json(
      { error: "CSV export is available on Premium." },
      { status: 403 }
    );
  }

  const { data: services, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("name, category")
    .eq("master_slug", slug);

  if (servicesError) {
    return NextResponse.json({ error: servicesError.message }, { status: 500 });
  }

  const categoryByServiceName = new Map(
    ((services || []) as ServiceRow[]).map((service) => [
      service.name,
      service.category || "Uncategorized",
    ])
  );

  let query = supabaseAdmin
    .from("appointments")
    .select(
      "appointment_date, appointment_time, service_name, client_name, client_phone, client_email, client_note, status, service_price_at_booking"
    )
    .eq("master_slug", slug)
    .in("status", ["active", "cancelled"]);

  if (dateRange.startDate) {
    query = query.gte("appointment_date", dateRange.startDate);
  }

  if (dateRange.endDate) {
    query = query.lte("appointment_date", dateRange.endDate);
  }

  const { data, error } = await query
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = buildCsv({
    rows: (data || []) as AppointmentRow[],
    categoryByServiceName,
  });
  const fileName = `appointly-${slug}-appointments-${period}.csv`;

  return new Response(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
