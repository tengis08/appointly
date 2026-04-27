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
                Choose a monthly subscription plan for {master.name}.
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
              Stripe checkout completed. Plan activation will be connected in the next step.
            </div>
          )}

          {cancelled && (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
              Checkout was cancelled. No payment was completed.
            </div>
          )}

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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}