import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isPremiumAccount(planType: string | null, subscriptionStatus: string | null) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

function createToken() {
  return randomBytes(32).toString("hex");
}

async function getLoggedMasterAccount() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("user_id, master_slug, plan_type, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError || !account) {
    return null;
  }

  return account;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const account = await getLoggedMasterAccount();

  if (!account || account.master_slug !== slug) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (!isPremiumAccount(account.plan_type, account.subscription_status)) {
    return NextResponse.json(
      { error: "Live calendar feed is available on Premium only." },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin
    .from("master_accounts")
    .update({ calendar_feed_token: createToken() })
    .eq("master_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}?calendar=regenerated`, request.url),
    { status: 303 }
  );
}
