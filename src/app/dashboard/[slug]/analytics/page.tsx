import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import AnalyticsClient from "@/components/analytics-client";
import { requireMasterAccess } from "@/lib/master-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getAnalyticsDateRange,
  normalizeAnalyticsGroup,
  normalizeAnalyticsPeriod,
  normalizeDateInput,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    period?: string;
    group?: string;
    startDate?: string;
    endDate?: string;
  }>;
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

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const selectedPeriod = normalizeAnalyticsPeriod(queryParams.period);
  const selectedGroup = normalizeAnalyticsGroup(queryParams.group);
  const selectedStartDate = normalizeDateInput(queryParams.startDate);
  const selectedEndDate = normalizeDateInput(queryParams.endDate);
  const dateRange = getAnalyticsDateRange({
    period: selectedPeriod,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
  });

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("slug, name")
    .eq("slug", slug)
    .single();

  if (!master) {
    notFound();
  }

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("plan_type, subscription_status")
    .eq("master_slug", slug)
    .maybeSingle();

  const isPremium = isPremiumAccount(
    account?.plan_type || null,
    account?.subscription_status || null
  );

  const { data: services } = await supabaseAdmin
    .from("master_services")
    .select("name, category")
    .eq("master_slug", slug)
    .order("name", { ascending: true });

  let appointments: AppointmentRow[] = [];

  if (isPremium) {
    let appointmentsQuery = supabaseAdmin
      .from("appointments")
      .select(
        "id, appointment_date, appointment_time, service_name, client_name, client_phone, client_email, client_note, status, service_price_at_booking"
      )
      .eq("master_slug", slug)
      .in("status", ["active", "cancelled"]);

    if (dateRange.startDate) {
      appointmentsQuery = appointmentsQuery.gte(
        "appointment_date",
        dateRange.startDate
      );
    }

    if (dateRange.endDate) {
      appointmentsQuery = appointmentsQuery.lte(
        "appointment_date",
        dateRange.endDate
      );
    }

    const { data: appointmentRows, error: appointmentsError } =
      await appointmentsQuery
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

    if (appointmentsError) {
      throw new Error(appointmentsError.message);
    }

    appointments = (appointmentRows || []) as AppointmentRow[];
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <AnalyticsClient
        slug={slug}
        masterName={master.name}
        isPremium={isPremium}
        appointments={appointments}
        services={(services || []) as ServiceRow[]}
        selectedPeriod={selectedPeriod}
        selectedGroup={selectedGroup}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
      />

      <Footer />
    </div>
  );
}
