import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getLoggedMaster() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user) return null;

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select(
      "master_slug, email, stripe_customer_id, stripe_subscription_id, plan_type, subscription_status"
    )
    .eq("user_id", user.id)
    .single();

  if (!account) return null;

  return account;
}

function isActiveOrTrialing(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

function shouldApplyFreeTrial(params: {
  stripeSubscriptionId: string | null | undefined;
  subscriptionStatus: string | null | undefined;
}) {
  // First paid subscription gets a 14-day trial.
  // If a master already had a Stripe subscription before, do not give another trial.
  if (params.stripeSubscriptionId) {
    return false;
  }

  if (isActiveOrTrialing(params.subscriptionStatus)) {
    return false;
  }

  return true;
}

async function redirectToBillingPortal(params: {
  request: Request;
  customerId: string;
  masterSlug: string;
}) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(params.request.url).origin;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${siteUrl}/dashboard/${params.masterSlug}/billing`,
  });

  return NextResponse.redirect(portalSession.url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const plan = String(formData.get("plan") || "").trim();

  const loggedMaster = await getLoggedMaster();

  if (!loggedMaster) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  if (plan !== "basic" && plan !== "premium") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  // Prevent accidentally creating a second active subscription.
  // Upgrades/downgrades should be handled through Stripe Billing Portal.
  if (
    loggedMaster.stripe_customer_id &&
    loggedMaster.stripe_subscription_id &&
    isActiveOrTrialing(loggedMaster.subscription_status)
  ) {
    return redirectToBillingPortal({
      request,
      customerId: loggedMaster.stripe_customer_id,
      masterSlug: loggedMaster.master_slug,
    });
  }

  const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID;
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;

  if (!basicPriceId || !premiumPriceId) {
    return NextResponse.json(
      { error: "Missing Stripe price IDs." },
      { status: 500 }
    );
  }

  const priceId = plan === "premium" ? premiumPriceId : basicPriceId;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const subscriptionData: {
    metadata: {
      master_slug: string;
      plan: string;
    };
    trial_period_days?: number;
  } = {
    metadata: {
      master_slug: loggedMaster.master_slug,
      plan,
    },
  };

  if (
    shouldApplyFreeTrial({
      stripeSubscriptionId: loggedMaster.stripe_subscription_id,
      subscriptionStatus: loggedMaster.subscription_status,
    })
  ) {
    subscriptionData.trial_period_days = 14;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    payment_method_collection: "always",
    customer: loggedMaster.stripe_customer_id || undefined,
    customer_email: loggedMaster.stripe_customer_id
      ? undefined
      : loggedMaster.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      master_slug: loggedMaster.master_slug,
      plan,
    },
    subscription_data: subscriptionData,
    success_url: `${siteUrl}/dashboard/${loggedMaster.master_slug}/billing?success=1&plan=${plan}`,
    cancel_url: `${siteUrl}/dashboard/${loggedMaster.master_slug}/billing?cancelled=1`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe checkout URL was not created." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
