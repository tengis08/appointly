import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MasterDashboardClient } from "@/components/master-dashboard-client";
import { requireMasterAccess } from "@/lib/master-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPublicBookingUrl } from "@/lib/subdomains";
import { getDateStringInTimeZone, normalizeTimeZone } from "@/lib/timezones";

export const dynamic = "force-dynamic";

type MasterDashboardPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    date?: string;
    sort?: string;
    calendar?: string;
  }>;
};

function normalizeDateInput(value: string | null | undefined) {
  const text = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  return "";
}

function isPremiumAccount(
  planType: string | null,
  subscriptionStatus: string | null
) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

export default async function MasterDashboardPage({
  params,
  searchParams,
}: MasterDashboardPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("host") || "localhost:3000";
  const requestProtocol =
    requestHeaders.get("x-forwarded-proto") ||
    (requestHost.includes("localhost") ? "http" : "https");
  const requestSiteUrl = `${requestProtocol}://${requestHost}`;

  const selectedSort = queryParams.sort === "oldest" ? "oldest" : "newest";

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("slug, name, timezone")
    .eq("slug", slug)
    .single();

  if (!master) {
    notFound();
  }

  const masterTimeZone = normalizeTimeZone(master.timezone);
  const today = getDateStringInTimeZone(new Date(), masterTimeZone);

  const selectedStartDate =
    normalizeDateInput(queryParams.startDate) ||
    normalizeDateInput(queryParams.date) ||
    today;

  const selectedEndDate =
    normalizeDateInput(queryParams.endDate) || selectedStartDate;

  const rangeStart =
    selectedStartDate <= selectedEndDate ? selectedStartDate : selectedEndDate;

  const rangeEnd =
    selectedStartDate <= selectedEndDate ? selectedEndDate : selectedStartDate;

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("plan_type, subscription_status, calendar_feed_token")
    .eq("master_slug", slug)
    .maybeSingle();

  const isPremium = isPremiumAccount(
    account?.plan_type || null,
    account?.subscription_status || null
  );

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestSiteUrl).replace(/\/$/, "");
  const calendarFeedUrl =
    isPremium && account?.calendar_feed_token && siteUrl
      ? `${siteUrl}/api/master-calendar-feed/${account.calendar_feed_token}.ics`
      : "";

  const publicBookingUrl = getPublicBookingUrl(slug, isPremium, siteUrl);

  let appointmentsQuery = supabaseAdmin
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, service_name, client_name, client_phone, client_email, client_note"
    )
    .eq("master_slug", slug)
    .eq("status", "active")
    .gte("appointment_date", rangeStart)
    .lte("appointment_date", rangeEnd);

  appointmentsQuery =
    selectedSort === "oldest"
      ? appointmentsQuery
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
      : appointmentsQuery
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });

  const { data: appointments } = await appointmentsQuery;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <MasterDashboardClient
        slug={slug}
        masterName={master.name}
        appointments={appointments || []}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        selectedSort={selectedSort}
        isPremium={isPremium}
        hasCalendarFeed={Boolean(account?.calendar_feed_token)}
        calendarFeedUrl={calendarFeedUrl}
        calendarStatus={queryParams.calendar || ""}
        publicBookingUrl={publicBookingUrl}
      />

      <Footer />
    </div>
  );
}
