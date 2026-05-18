import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type PlanType = "free" | "basic" | "premium";
type PaidPlanType = "basic" | "premium";

type CheckoutSessionMetadata = {
  masterSlug: string | null;
  plan: PaidPlanType | null;
};

function isPaidPlan(
  value: string | null | undefined
): value is PaidPlanType {
  return value === "basic" || value === "premium";
}

function getPlanFromPriceId(
  priceId: string | null | undefined
): PaidPlanType | null {
  if (!priceId) return null;

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    return "basic";
  }

  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    return "premium";
  }

  return null;
}

function getPlanFromMetadata(
  value: string | null | undefined
): PaidPlanType | null {
  if (value === "basic") return "basic";
  if (value === "premium") return "premium";

  return null;
}

function getPlanFromPriceAmount(
  subscription: Stripe.Subscription
): PaidPlanType | null {
  const price = subscription.items.data[0]?.price;

  if (!price) return null;
  if (price.currency !== "usd") return null;

  if (price.unit_amount === 999) {
    return "basic";
  }

  if (price.unit_amount === 1499) {
    return "premium";
  }

  return null;
}

function shouldKeepPaidPlan(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.id || null;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  if (!currentPeriodEnd) {
    return null;
  }

  return new Date(currentPeriodEnd * 1000).toISOString();
}

function getCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

async function getCheckoutSessionMetadataForSubscription(
  subscriptionId: string
): Promise<CheckoutSessionMetadata> {
  try {
    const sessions = await stripe.checkout.sessions.list({
      subscription: subscriptionId,
      limit: 1,
    });

    const session = sessions.data[0];

    return {
      masterSlug: session?.metadata?.master_slug || null,
      plan: getPlanFromMetadata(session?.metadata?.plan),
    };
  } catch (error) {
    console.error("Could not retrieve checkout session for subscription:", {
      subscriptionId,
      error,
    });

    return {
      masterSlug: null,
      plan: null,
    };
  }
}

async function getSubscriptionPlan(params: {
  subscription: Stripe.Subscription;
  fallbackPlan?: string | null;
}) {
  const priceId = getSubscriptionPriceId(params.subscription);

  const planFromPrice = getPlanFromPriceId(priceId);

  if (planFromPrice) {
    return planFromPrice;
  }

  const planFromSubscriptionMetadata = getPlanFromMetadata(
    params.subscription.metadata?.plan
  );

  if (planFromSubscriptionMetadata) {
    console.warn(
      "Stripe price ID was not recognized. Using subscription metadata plan.",
      {
        subscriptionId: params.subscription.id,
        priceId,
        plan: planFromSubscriptionMetadata,
      }
    );

    return planFromSubscriptionMetadata;
  }

  const planFromFallbackMetadata = getPlanFromMetadata(params.fallbackPlan);

  if (planFromFallbackMetadata) {
    console.warn(
      "Stripe price ID was not recognized. Using fallback metadata plan.",
      {
        subscriptionId: params.subscription.id,
        priceId,
        plan: planFromFallbackMetadata,
      }
    );

    return planFromFallbackMetadata;
  }

  const checkoutSessionMetadata =
    await getCheckoutSessionMetadataForSubscription(params.subscription.id);

  if (checkoutSessionMetadata.plan) {
    console.warn(
      "Stripe price ID was not recognized. Using checkout session metadata plan.",
      {
        subscriptionId: params.subscription.id,
        priceId,
        plan: checkoutSessionMetadata.plan,
      }
    );

    return checkoutSessionMetadata.plan;
  }

  const planFromAmount = getPlanFromPriceAmount(params.subscription);

  if (planFromAmount) {
    console.warn(
      "Stripe price ID was not recognized. Using price amount fallback.",
      {
        subscriptionId: params.subscription.id,
        priceId,
        plan: planFromAmount,
      }
    );

    return planFromAmount;
  }

  console.error("Stripe subscription plan could not be determined.", {
    subscriptionId: params.subscription.id,
    priceId,
    subscriptionStatus: params.subscription.status,
    subscriptionMetadata: params.subscription.metadata,
    stripeBasicPriceIdExists: Boolean(process.env.STRIPE_BASIC_PRICE_ID),
    stripePremiumPriceIdExists: Boolean(process.env.STRIPE_PREMIUM_PRICE_ID),
  });

  return null;
}

async function getMasterSlugFromSubscription(params: {
  subscription: Stripe.Subscription;
  fallbackMasterSlug?: string | null;
}) {
  if (params.fallbackMasterSlug) {
    return params.fallbackMasterSlug;
  }

  const masterSlugFromSubscription = params.subscription.metadata?.master_slug;

  if (masterSlugFromSubscription) {
    return masterSlugFromSubscription;
  }

  const checkoutSessionMetadata =
    await getCheckoutSessionMetadataForSubscription(params.subscription.id);

  if (checkoutSessionMetadata.masterSlug) {
    return checkoutSessionMetadata.masterSlug;
  }

  return null;
}

async function updateAccountFromSubscription(params: {
  subscription: Stripe.Subscription;
  masterSlug?: string | null;
  fallbackPlan?: string | null;
}) {
  const subscription = params.subscription;

  const subscriptionId = subscription.id;
  const customerId = getCustomerId(subscription);
  const status = subscription.status;
  const currentPeriodEnd = getCurrentPeriodEnd(subscription);

  const plan = await getSubscriptionPlan({
    subscription,
    fallbackPlan: params.fallbackPlan,
  });

  const keepsPaidPlan = shouldKeepPaidPlan(status);

  let nextPlanType: PlanType = "free";

  if (keepsPaidPlan) {
    if (!isPaidPlan(plan)) {
      throw new Error(
        `Stripe subscription ${subscriptionId} is ${status}, but plan could not be determined. Database was not updated.`
      );
    }

    nextPlanType = plan;
  }

  const masterSlug = await getMasterSlugFromSubscription({
    subscription,
    fallbackMasterSlug: params.masterSlug,
  });

  const updateData = {
    plan_type: nextPlanType,
    subscription_status: status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_current_period_end: currentPeriodEnd,
  };

  if (masterSlug) {
    const { error } = await supabaseAdmin
      .from("master_accounts")
      .update(updateData)
      .eq("master_slug", masterSlug);

    if (error) {
      throw error;
    }

    return;
  }

  const { data: accountBySubscription, error: accountBySubscriptionError } =
    await supabaseAdmin
      .from("master_accounts")
      .select("master_slug")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

  if (accountBySubscriptionError) {
    throw accountBySubscriptionError;
  }

  if (accountBySubscription?.master_slug) {
    const { error } = await supabaseAdmin
      .from("master_accounts")
      .update(updateData)
      .eq("master_slug", accountBySubscription.master_slug);

    if (error) {
      throw error;
    }

    return;
  }

  const { data: accountByCustomer, error: accountByCustomerError } =
    await supabaseAdmin
      .from("master_accounts")
      .select("master_slug")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

  if (accountByCustomerError) {
    throw accountByCustomerError;
  }

  if (accountByCustomer?.master_slug) {
    const { error } = await supabaseAdmin
      .from("master_accounts")
      .update(updateData)
      .eq("master_slug", accountByCustomer.master_slug);

    if (error) {
      throw error;
    }

    return;
  }

  throw new Error(
    `Could not find master account for Stripe subscription ${subscriptionId}.`
  );
}

async function activateSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session
) {
  const masterSlug = session.metadata?.master_slug || null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!masterSlug || !subscriptionId) {
    console.log("Missing checkout session data", {
      masterSlug,
      subscriptionId,
    });

    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await updateAccountFromSubscription({
    subscription,
    masterSlug,
    fallbackPlan: session.metadata?.plan || null,
  });
}

async function updateSubscription(subscription: Stripe.Subscription) {
  await updateAccountFromSubscription({
    subscription,
    masterSlug: subscription.metadata?.master_slug || null,
    fallbackPlan: subscription.metadata?.plan || null,
  });
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const { error } = await supabaseAdmin
    .from("master_accounts")
    .update({
      plan_type: "free",
      subscription_status: "cancelled",
      stripe_subscription_id: subscriptionId,
      stripe_current_period_end: getCurrentPeriodEnd(subscription),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET environment variable." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      await activateSubscriptionFromCheckoutSession(
        event.data.object as Stripe.Checkout.Session
      );
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      await updateSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      await cancelSubscription(event.data.object as Stripe.Subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}