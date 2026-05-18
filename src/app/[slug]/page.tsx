import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MasterPublicPage } from "@/components/master-public-page";
import { getMasterFromDb } from "@/lib/masters-db";
import { getSubdomainFromHost } from "@/lib/subdomains";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canAcceptBookings } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type MasterPageProps = {
  params: Promise<{ slug: string }>;
};

function isPremiumAccount(params: {
  planType: string | null | undefined;
  subscriptionStatus: string | null | undefined;
}) {
  return (
    params.planType === "premium" &&
    canAcceptBookings({
      planType: params.planType,
      subscriptionStatus: params.subscriptionStatus,
    })
  );
}

export default async function MasterPage({ params }: MasterPageProps) {
  const { slug } = await params;

  const requestHeaders = await headers();
  const subdomainSlug = getSubdomainFromHost(requestHeaders.get("host"));

  // If this request came from a personal subdomain, the subdomain must match the slug.
  if (subdomainSlug && subdomainSlug !== slug) {
    notFound();
  }

  const master = await getMasterFromDb(slug);

  if (!master) {
    notFound();
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("plan_type, subscription_status")
    .eq("master_slug", slug)
    .maybeSingle();

  if (accountError) {
    console.error("public master page account error:", accountError);
    notFound();
  }

  const allowedToShowPublicPage = canAcceptBookings({
    planType: account?.plan_type,
    subscriptionStatus: account?.subscription_status,
  });

  if (!allowedToShowPublicPage) {
    notFound();
  }

  const premiumAccount = isPremiumAccount({
    planType: account?.plan_type,
    subscriptionStatus: account?.subscription_status,
  });

  // Direct public pages work for Basic and Premium:
  // appointly.vip/test-master
  //
  // Personal subdomains are Premium-only:
  // test-master.appointly.vip
  if (subdomainSlug && !premiumAccount) {
    notFound();
  }

  return <MasterPublicPage master={master} isPremium={premiumAccount} />;
}
