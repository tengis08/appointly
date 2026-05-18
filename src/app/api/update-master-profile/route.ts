import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeTimeZone } from "@/lib/timezones";

function cleanValue(value: string) {
  return value.trim();
}

function sanitizeUsername(value: string) {
  return value.trim().replace(/^@/, "").trim();
}

function normalizeBookingWindowDays(value: number) {
  if (value === 14 || value === 21 || value === 30 || value === 60 || value === 90) {
    return value;
  }

  return 30;
}

function normalizeSlotStepMinutes(value: number) {
  const allowedValues = new Set([15, 30, 45, 60, 120, 180, 240, 300, 360, 420, 480]);

  if (allowedValues.has(value)) {
    return value;
  }

  return 30;
}

function trimToMax(value: string, maxLength: number) {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength).trim() : trimmed;
}

function isPremiumAccount(planType: string | null, subscriptionStatus: string | null) {
  return (
    planType === "premium" &&
    (subscriptionStatus === "active" || subscriptionStatus === "trialing")
  );
}

function normalizeInstagramUrl(value: string) {
  const trimmed = cleanValue(value);
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const username = sanitizeUsername(trimmed).replace(/[^a-zA-Z0-9._]/g, "");
    if (!username) return null;
    return `https://www.instagram.com/${username}`;
  }

  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return `https://www.instagram.com/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = new Set([
      "instagram.com",
      "www.instagram.com",
      "m.instagram.com",
    ]);

    if (!allowedHosts.has(url.hostname.toLowerCase())) return null;

    url.protocol = "https:";
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeTelegramUrl(value: string) {
  const trimmed = cleanValue(value);
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const username = sanitizeUsername(trimmed).replace(/[^a-zA-Z0-9_]/g, "");
    if (!username) return null;
    return `https://t.me/${username}`;
  }

  if (/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return `https://t.me/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = new Set(["t.me", "telegram.me", "www.t.me"]);

    if (!allowedHosts.has(url.hostname.toLowerCase())) return null;

    url.protocol = "https:";
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeFacebookUrl(value: string) {
  const trimmed = cleanValue(value);
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9.\-]+$/.test(trimmed)) {
    return `https://www.facebook.com/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = new Set([
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "fb.com",
      "www.fb.com",
    ]);

    if (!allowedHosts.has(url.hostname.toLowerCase())) return null;

    url.protocol = "https:";
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeTiktokUrl(value: string) {
  const trimmed = cleanValue(value);
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const username = sanitizeUsername(trimmed).replace(/[^a-zA-Z0-9._]/g, "");
    if (!username) return null;
    return `https://www.tiktok.com/@${username}`;
  }

  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return `https://www.tiktok.com/@${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = new Set([
      "tiktok.com",
      "www.tiktok.com",
      "m.tiktok.com",
    ]);

    if (!allowedHosts.has(url.hostname.toLowerCase())) return null;

    url.protocol = "https:";
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeVkUrl(value: string) {
  const trimmed = cleanValue(value);
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const username = sanitizeUsername(trimmed).replace(/[^a-zA-Z0-9._]/g, "");
    if (!username) return null;
    return `https://vk.com/${username}`;
  }

  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return `https://vk.com/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const allowedHosts = new Set(["vk.com", "www.vk.com", "m.vk.com"]);

    if (!allowedHosts.has(url.hostname.toLowerCase())) return null;

    url.protocol = "https:";
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const about = String(formData.get("about") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const bookingEmail = String(formData.get("bookingEmail") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const timeZone = normalizeTimeZone(String(formData.get("timeZone") || ""));
  const neighborhood = String(formData.get("neighborhood") || "").trim();
  const showInDirectory = formData.get("showInDirectory") === "1";
  const customBookingMessage = trimToMax(String(formData.get("customBookingMessage") || ""), 600);
  const bookingPolicyText = trimToMax(String(formData.get("bookingPolicyText") || ""), 800);

  const slotStepMinutes = normalizeSlotStepMinutes(
    Number(formData.get("slotStepMinutes") || 30)
  );
  const bookingWindowDays = normalizeBookingWindowDays(
    Number(formData.get("bookingWindowDays") || 30)
  );

  const rawInstagramUrl = String(formData.get("instagramUrl") || "").trim();
  const rawTelegramUrl = String(formData.get("telegramUrl") || "").trim();
  const rawFacebookUrl = String(formData.get("facebookUrl") || "").trim();
  const rawTiktokUrl = String(formData.get("tiktokUrl") || "").trim();
  const rawVkUrl = String(formData.get("vkUrl") || "").trim();

  const instagramUrl = normalizeInstagramUrl(rawInstagramUrl);
  const telegramUrl = normalizeTelegramUrl(rawTelegramUrl);
  const facebookUrl = normalizeFacebookUrl(rawFacebookUrl);
  const tiktokUrl = normalizeTiktokUrl(rawTiktokUrl);
  const vkUrl = normalizeVkUrl(rawVkUrl);

  if (rawInstagramUrl && !instagramUrl) {
    return NextResponse.json(
      {
        error:
          "Instagram link must be a valid Instagram URL or username, for example @username.",
      },
      { status: 400 }
    );
  }

  if (rawTelegramUrl && !telegramUrl) {
    return NextResponse.json(
      {
        error:
          "Telegram link must be a valid Telegram URL or username, for example @username.",
      },
      { status: 400 }
    );
  }

  if (rawFacebookUrl && !facebookUrl) {
    return NextResponse.json(
      {
        error: "Facebook link must be a valid Facebook URL or page name.",
      },
      { status: 400 }
    );
  }

  if (rawTiktokUrl && !tiktokUrl) {
    return NextResponse.json(
      {
        error:
          "TikTok link must be a valid TikTok URL or username, for example @username.",
      },
      { status: 400 }
    );
  }

  if (rawVkUrl && !vkUrl) {
    return NextResponse.json(
      {
        error: "VK link must be a valid VK URL or username.",
      },
      { status: 400 }
    );
  }

  if (!slug || !name || !bookingEmail) {
    return NextResponse.json(
      { error: "Slug, name, and booking email are required." },
      { status: 400 }
    );
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

  const updateData: Record<string, string | number | boolean | null> = {
    name,
    about: about || null,
    phone: phone || null,
    whatsapp: phone || null,
    address: address || null,
    booking_email: bookingEmail,
    country: country || null,
    city: city || null,
    timezone: timeZone,
    neighborhood: neighborhood || null,

    instagram_url: instagramUrl,
    telegram_url: telegramUrl,
    facebook_url: facebookUrl,
    tiktok_url: tiktokUrl,
    vk_url: vkUrl,

    slot_step_minutes: slotStepMinutes,
    booking_window_days: bookingWindowDays,
  };

  if (isPremiumAccount(account.plan_type || null, account.subscription_status || null)) {
    updateData.page_theme = "classic";
    updateData.show_in_directory = showInDirectory;
    updateData.custom_booking_message = customBookingMessage || null;
    updateData.booking_policy_text = bookingPolicyText || null;
  } else {
    updateData.page_theme = "classic";
    updateData.show_in_directory = true;
  }

  const { error: updateError } = await supabaseAdmin
    .from("masters")
    .update(updateData)
    .eq("slug", slug);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}/settings?updated=1`, request.url),
    { status: 303 }
  );
}