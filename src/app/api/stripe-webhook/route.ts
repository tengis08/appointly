import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function getPlanFromPriceId(priceId: string | null | undefined) {
  if (!priceId) return "free";

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    return "basic";
  }

  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    return "premium";
  }

  return "free";
}

async function activateSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session
) {
  const masterSlug = session.metadata?.master_slug;
  const planFromMetadata = session.metadata?.plan;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!masterSlug || !customerId || !subscriptionId) {
    console.log("Missing checkout session data", {
      masterSlug,
      customerId,
      subscriptionId,
    });
    return;
  }

  const plan =
    planFromMetadata === "premium"
      ? "premium"
      : planFromMetadata === "basic"
        ? "basic"
        : "free";

  const { error } = await supabaseAdmin
    .from("master_accounts")
    .update({
      plan_type: plan,
      subscription_status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq("master_slug", masterSlug);

  if (error) {
    throw error;
  }
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id;
  const planFromPrice = getPlanFromPriceId(priceId);

  const planFromMetadata =
    subscription.metadata?.plan === "premium"
      ? "premium"
      : subscription.metadata?.plan === "basic"
        ? "basic"
        : planFromPrice;

  const masterSlug = subscription.metadata?.master_slug;

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
    ? new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString()
    : null;

  let query = supabaseAdmin.from("master_accounts").update({
    plan_type: subscription.status === "active" ? planFromMetadata : "free",
    subscription_status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_current_period_end: currentPeriodEnd,
  });

  if (masterSlug) {
    query = query.eq("master_slug", masterSlug);
  } else {
    query = query.eq("stripe_subscription_id", subscriptionId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const { error } = await supabaseAdmin
    .from("master_accounts")
    .update({
      plan_type: "free",
      subscription_status: "cancelled",
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

    if (event.type === "customer.subscription.updated") {
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