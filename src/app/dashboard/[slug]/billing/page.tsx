import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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

function formatPlanName(plan: string | null | undefined) {
  if (plan === "premium") return "Premium";
  if (plan === "basic") return "Basic";
  return "Free";
}

function formatStatus(status: string | null | undefined) {
  if (status === "active") return "Active";
  if (status === "trialing") return "Trialing";
  if (status === "past_due") return "Past due";
  if (status === "cancelled") return "Cancelled";
  if (status === "canceled") return "Canceled";
  if (status === "inactive") return "Inactive";
  return "Inactive";
}

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
    .single();

  const currentPlan = account?.plan_type || "free";
  const subscriptionStatus = account?.subscription_status || "inactive";
  const hasStripeCustomer = Boolean(account?.stripe_customer_id);

  const success = queryParams.success === "1";
  const cancelled = queryParams.cancelled === "1";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Master dashboard
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
                Billing
              </h1>

              <p className="mt-4 text-neutral-600">
                Manage the monthly subscription plan for {master.name}.
              </p>
            </div>

            <Link
              href={`/dashboard/${slug}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              Back to dashboard
            </Link>
          </div>

          {success && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              Stripe checkout completed. Your subscription status is shown
              below.
            </div>
          )}

          {cancelled && (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
              Checkout was cancelled. No payment was completed.
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">
                  Current subscription
                </h2>

                <p className="mt-2 text-sm text-neutral-600">
                  View your current plan and manage your billing settings.
                </p>
              </div>

              {hasStripeCustomer && (
                <form action="/api/create-customer-portal-session" method="POST">
                  <button className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                    Manage subscription
                  </button>
                </form>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm text-neutral-500">Current plan</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">
                  {formatPlanName(currentPlan)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm text-neutral-500">Subscription status</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">
                  {formatStatus(subscriptionStatus)}
                </p>
              </div>
            </div>

            {account?.stripe_current_period_end && (
              <p className="mt-4 text-sm text-neutral-600">
                Current period ends:{" "}
                {new Date(
                  account.stripe_current_period_end
                ).toLocaleDateString("en-US")}
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Basic
              </h2>

              <p className="mt-3 text-neutral-600">
                For independent masters who need simple online booking.
              </p>

              <div className="mt-6 text-4xl font-bold text-neutral-900">
                $9.99
                <span className="text-base font-medium text-neutral-500">
                  /month
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                <li>Booking page</li>
                <li>Master dashboard</li>
                <li>Services editor</li>
                <li>Availability editor</li>
                <li>Email notifications</li>
                <li>Client cancellation link</li>
              </ul>

              {currentPlan === "basic" && subscriptionStatus === "active" ? (
                <div className="mt-8 rounded-full border border-green-300 bg-green-50 px-6 py-3 text-center text-sm font-semibold text-green-700">
                  Current plan
                </div>
              ) : (
                <form
                  action="/api/create-checkout-session"
                  method="POST"
                  className="mt-8"
                >
                  <input type="hidden" name="plan" value="basic" />

                  <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                    Choose Basic
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-900 p-6">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Premium
              </h2>

              <p className="mt-3 text-neutral-600">
                For growing masters who want future automation features.
              </p>

              <div className="mt-6 text-4xl font-bold text-neutral-900">
                $24.99
                <span className="text-base font-medium text-neutral-500">
                  /month
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                <li>Everything in Basic</li>
                <li>Future SMS reminders</li>
                <li>Future WhatsApp/Telegram automation</li>
                <li>Priority feature access</li>
                <li>Premium support</li>
              </ul>

              {currentPlan === "premium" && subscriptionStatus === "active" ? (
                <div className="mt-8 rounded-full border border-green-300 bg-green-50 px-6 py-3 text-center text-sm font-semibold text-green-700">
                  Current plan
                </div>
              ) : (
                <form
                  action="/api/create-checkout-session"
                  method="POST"
                  className="mt-8"
                >
                  <input type="hidden" name="plan" value="premium" />

                  <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                    Choose Premium
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}