import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SettingsClient } from "@/components/settings-client";
import { getMasterFromDb } from "@/lib/masters-db";
import { requireMasterAccess } from "@/lib/master-auth";
import { getPublicBookingUrl } from "@/lib/subdomains";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export default async function MasterSettingsPage({
  params,
  searchParams,
}: SettingsPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("host") || "localhost:3000";
  const requestProtocol =
    requestHeaders.get("x-forwarded-proto") ||
    (requestHost.includes("localhost") ? "http" : "https");
  const requestSiteUrl = `${requestProtocol}://${requestHost}`;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestSiteUrl).replace(/\/$/, "");

  const master = await getMasterFromDb(slug);

  if (!master) {
    notFound();
  }

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select(
      "plan_type, subscription_status, telegram_chat_id, telegram_connected_at, telegram_notifications_enabled"
    )
    .eq("master_slug", slug)
    .maybeSingle();

  const premiumFeaturesAvailable =
    account?.plan_type === "premium" &&
    (account?.subscription_status === "active" ||
      account?.subscription_status === "trialing");

  const publicBookingUrl = getPublicBookingUrl(
    slug,
    premiumFeaturesAvailable,
    siteUrl
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <SettingsClient
        master={master}
        updated={queryParams.updated === "1"}
        publicBookingUrl={publicBookingUrl}
        telegram={{
          currentPlan: account?.plan_type || "free",
          subscriptionStatus: account?.subscription_status || "inactive",
          isConnected: Boolean(
            account?.telegram_chat_id && account?.telegram_notifications_enabled
          ),
          connectedAt: account?.telegram_connected_at || null,
          botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "",
        }}
      />

      <Footer />
    </div>
  );
}
