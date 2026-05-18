import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createQrCodeSvg } from "@/lib/qr-svg";
import { getPublicBookingUrl } from "@/lib/subdomains";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isPremiumAccount(
  planType: string | null,
  subscriptionStatus: string | null
) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

function normalizeSlug(value: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

async function getLoggedMasterSlug() {
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
    .select("master_slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError || !account) {
    return null;
  }

  return account.master_slug as string;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const slug = normalizeSlug(searchParams.get("slug"));

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const loggedMasterSlug = await getLoggedMasterSlug();

  if (loggedMasterSlug !== slug) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select("slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (masterError || !master) {
    return NextResponse.json({ error: "Master not found." }, { status: 404 });
  }

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("plan_type, subscription_status")
    .eq("master_slug", slug)
    .maybeSingle();

  const premiumAccount = isPremiumAccount(
    account?.plan_type || null,
    account?.subscription_status || null
  );

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, "");
  const publicUrl = getPublicBookingUrl(slug, premiumAccount, siteUrl);

  let svg: string;

  try {
    svg = createQrCodeSvg(publicUrl, `${master.name} booking QR code`);
  } catch (error) {
    console.error("QR code generation failed:", error);
    return NextResponse.json({ error: "Could not generate QR code." }, { status: 500 });
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="appointly-${slug}-qr.svg"`,
      "Cache-Control": "no-store",
    },
  });
}
