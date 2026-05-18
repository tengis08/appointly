import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BillingClient } from "@/components/billing-client";
import { requireMasterAccess } from "@/lib/master-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type BillingPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    success?: string;
    cancelled?: string;
    plan?: string;
  }>;
};

export default async function BillingPage({
  params,
  searchParams,
}: BillingPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

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
    .select(
      "plan_type, subscription_status, stripe_customer_id, stripe_subscription_id, stripe_current_period_end"
    )
    .eq("master_slug", slug)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <BillingClient
        slug={slug}
        masterName={master.name}
        currentPlan={account?.plan_type || "free"}
        subscriptionStatus={account?.subscription_status || "inactive"}
        hasStripeCustomer={Boolean(account?.stripe_customer_id)}
        currentPeriodEnd={account?.stripe_current_period_end || null}
        success={queryParams.success === "1"}
        cancelled={queryParams.cancelled === "1"}
      />

      <Footer />
    </div>
  );
}