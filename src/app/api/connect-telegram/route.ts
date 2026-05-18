import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isPremiumActive(params: {
  planType?: string | null;
  subscriptionStatus?: string | null;
}) {
  return (
    params.planType === "premium" &&
    (params.subscriptionStatus === "active" ||
      params.subscriptionStatus === "trialing")
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug, plan_type, subscription_status")
    .eq("user_id", user.id)
    .single();

  if (accountError || !account || account.master_slug !== slug) {
    return NextResponse.json(
      { error: "You do not have access to this profile." },
      { status: 403 }
    );
  }

  if (
    !isPremiumActive({
      planType: account.plan_type,
      subscriptionStatus: account.subscription_status,
    })
  ) {
    return NextResponse.redirect(
      new URL(`/dashboard/${slug}/billing`, request.url),
      { status: 303 }
    );
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!botUsername) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_TELEGRAM_BOT_USERNAME environment variable." },
      { status: 500 }
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("master_accounts")
    .update({
      telegram_connect_token: token,
      telegram_connect_expires_at: expiresAt,
    })
    .eq("master_slug", slug)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(
    `https://t.me/${botUsername}?start=${encodeURIComponent(token)}`,
    { status: 303 }
  );
}
