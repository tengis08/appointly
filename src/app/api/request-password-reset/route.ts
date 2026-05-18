import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp } from "@/lib/turnstile";
import {
  checkRateLimit,
  cleanupOldRateLimitRows,
  normalizeRateLimitValue,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const genericRedirect = new URL("/forgot-password?sent=1", request.url);

  try {
    const formData = await request.formData();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const clientIp = getClientIp(request) || "unknown-ip";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    // Always return the same success message to avoid revealing whether an email exists.
    if (!email) {
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    const ipRateLimit = await checkRateLimit({
      key: `password-reset:ip:${normalizeRateLimitValue(clientIp)}`,
      limit: 3,
      windowSeconds: 60 * 60,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    const emailRateLimit = await checkRateLimit({
      key: `password-reset:email:${normalizeRateLimitValue(email)}`,
      limit: 3,
      windowSeconds: 60 * 60,
    });

    if (!emailRateLimit.allowed) {
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    cleanupOldRateLimitRows().catch((error) => {
      console.error("request-password-reset rate limit cleanup failed:", error);
    });

    const { data: account, error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .select("user_id, master_slug, email")
      .eq("email", email)
      .maybeSingle();

    if (accountError) {
      console.error("request-password-reset account error:", accountError);
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    if (!account) {
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    const resetToken = crypto.randomUUID();
    const resetTokenHash = hashPasswordResetToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("master_accounts")
      .update({
        password_reset_token: resetTokenHash,
        password_reset_expires_at: expiresAt,
      })
      .eq("email", email);

    if (updateError) {
      console.error("request-password-reset update error:", updateError);
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

    const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      to: account.email,
      resetUrl,
    });

    return NextResponse.redirect(genericRedirect, { status: 303 });
  } catch (error) {
    console.error("request-password-reset error:", error);

    return NextResponse.redirect(genericRedirect, { status: 303 });
  }
}