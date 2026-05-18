import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getAnalyticsDateRange,
  normalizeAnalyticsPeriod,
  normalizeDateInput,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

type MasterRow = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
};

type ServiceRow = {
  master_slug: string;
  name: string;
  category: string | null;
};

type AppointmentRow = {
  appointment_date: string;
  appointment_time: string;
  master_slug: string;
  service_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
  client_note: string | null;
  status: string | null;
  service_price_at_booking: number | string | null;
};

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function getServiceCategory(params: {
  serviceMap: Map<string, string>;
  masterSlug: string;
  serviceName: string;
}) {
  return (
    params.serviceMap.get(`${params.masterSlug}::${params.serviceName}`) ||
    "Uncategorized"
  );
}

function buildCsv(params: {
  appointments: AppointmentRow[];
  masterBySlug: Map<string, MasterRow>;
  serviceMap: Map<string, string>;
}) {
  const headers = [
    "master_slug",
    "master_name",
    "country",
    "city",
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

  for (const row of params.appointments) {
    const master = params.masterBySlug.get(row.master_slug);
    const category = getServiceCategory({
      serviceMap: params.serviceMap,
      masterSlug: row.master_slug,
      serviceName: row.service_name,
    });

    lines.push(
      [
        row.master_slug,
        master?.name || row.master_slug,
        master?.country || "",
        master?.city || "",
        row.appointment_date,
        row.appointment_time,
        category,
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

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  const isAdmin = await isAdminLoggedIn();

  if (!isAdmin) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const selectedCountry = String(searchParams.get("country") || "").trim();
  const selectedCity = String(searchParams.get("city") || "").trim();
  const selectedMaster = String(searchParams.get("master") || "").trim();
  const selectedCategory = String(searchParams.get("category") || "").trim();
  const period = normalizeAnalyticsPeriod(searchParams.get("period"));
  const startDate = normalizeDateInput(searchParams.get("startDate"));
  const endDate = normalizeDateInput(searchParams.get("endDate"));
  const dateRange = getAnalyticsDateRange({ period, startDate, endDate });

  const { data: mastersData, error: mastersError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, country, city")
    .order("name", { ascending: true });

  if (mastersError) {
    return NextResponse.json({ error: mastersError.message }, { status: 500 });
  }

  const allMasters = (mastersData || []) as MasterRow[];

  const filteredMasters = allMasters.filter((master) => {
    const countryMatches = selectedCountry
      ? master.country === selectedCountry
      : true;
    const cityMatches = selectedCity ? master.city === selectedCity : true;
    const masterMatches = selectedMaster ? master.slug === selectedMaster : true;

    return countryMatches && cityMatches && masterMatches;
  });

  const filteredSlugs = filteredMasters.map((master) => master.slug);

  const masterBySlug = new Map(
    allMasters.map((master) => [master.slug, master] as const)
  );

  const { data: servicesData, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("master_slug, name, category")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (servicesError) {
    return NextResponse.json({ error: servicesError.message }, { status: 500 });
  }

  const services = (servicesData || []) as ServiceRow[];
  const serviceMap = new Map(
    services.map((service) => [
      `${service.master_slug}::${service.name}`,
      service.category || "Uncategorized",
    ])
  );

  let appointments: AppointmentRow[] = [];

  if (filteredSlugs.length > 0 || (!selectedCountry && !selectedCity && !selectedMaster)) {
    let query = supabaseAdmin
      .from("appointments")
      .select(
        "appointment_date, appointment_time, master_slug, service_name, client_name, client_phone, client_email, client_note, status, service_price_at_booking"
      )
      .in("status", ["active", "cancelled"]);

    if (selectedCountry || selectedCity || selectedMaster) {
      query = query.in("master_slug", filteredSlugs);
    }

    if (dateRange.startDate) {
      query = query.gte("appointment_date", dateRange.startDate);
    }

    if (dateRange.endDate) {
      query = query.lte("appointment_date", dateRange.endDate);
    }

    const { data: appointmentsData, error: appointmentsError } = await query
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (appointmentsError) {
      return NextResponse.json(
        { error: appointmentsError.message },
        { status: 500 }
      );
    }

    appointments = (appointmentsData || []) as AppointmentRow[];
  }

  if (selectedCategory) {
    appointments = appointments.filter(
      (appointment) =>
        getServiceCategory({
          serviceMap,
          masterSlug: appointment.master_slug,
          serviceName: appointment.service_name,
        }) === selectedCategory
    );
  }

  const csv = buildCsv({ appointments, masterBySlug, serviceMap });

  const fileParts = [
    "appointly-admin-appointments",
    period,
    selectedCountry ? safeFilePart(selectedCountry) : "all-countries",
    selectedCity ? safeFilePart(selectedCity) : "all-cities",
    selectedMaster ? safeFilePart(selectedMaster) : "all-masters",
    selectedCategory ? safeFilePart(selectedCategory) : "all-categories",
  ];

  return new Response(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileParts.join("-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
