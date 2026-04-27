import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getLoggedMaster() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user) {
    return null;
  }

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!account) {
    return null;
  }

  return account;
}

export async function POST(request: Request) {
  const loggedMaster = await getLoggedMaster();

  if (!loggedMaster) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  if (!loggedMaster.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found for this master." },
      { status: 400 }
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: loggedMaster.stripe_customer_id,
    return_url: `${siteUrl}/dashboard/${loggedMaster.master_slug}/billing`,
  });

  return NextResponse.redirect(portalSession.url, { status: 303 });
}