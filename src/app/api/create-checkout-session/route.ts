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
    .select("master_slug, email")
    .eq("user_id", user.id)
    .single();

  if (!account) return null;

  return account;
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

  const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID;
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;

  if (!basicPriceId || !premiumPriceId) {
    return NextResponse.json(
      { error: "Missing Stripe price IDs." },
      { status: 500 }
    );
  }

  const priceId =
    plan === "premium" ? premiumPriceId : plan === "basic" ? basicPriceId : null;

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: loggedMaster.email,
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
    subscription_data: {
      metadata: {
        master_slug: loggedMaster.master_slug,
        plan,
      },
    },
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