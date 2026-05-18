import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
  try {
    const formData = await request.formData();

    const token = String(formData.get("token") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const clientIp = getClientIp(request) || "unknown-ip";

    if (!token) {
      return NextResponse.redirect(
        new URL("/reset-password?error=missing-token", request.url),
        { status: 303 }
      );
    }

    const resetRateLimit = await checkRateLimit({
      key: `reset-password:ip:${normalizeRateLimitValue(clientIp)}`,
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!resetRateLimit.allowed) {
      return NextResponse.redirect(
        new URL("/reset-password?error=server-error", request.url),
        { status: 303 }
      );
    }

    cleanupOldRateLimitRows().catch((error) => {
      console.error("reset-password rate limit cleanup failed:", error);
    });

    if (!password || password.length < 6) {
      return NextResponse.redirect(
        new URL(
          `/reset-password?token=${encodeURIComponent(
            token
          )}&error=short-password`,
          request.url
        ),
        { status: 303 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.redirect(
        new URL(
          `/reset-password?token=${encodeURIComponent(
            token
          )}&error=passwords-do-not-match`,
          request.url
        ),
        { status: 303 }
      );
    }

    const tokenHash = hashPasswordResetToken(token);

    const { data: account, error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .select("user_id, password_reset_expires_at")
      .eq("password_reset_token", tokenHash)
      .maybeSingle();

    if (accountError || !account) {
      return NextResponse.redirect(
        new URL("/reset-password?error=invalid-token", request.url),
        { status: 303 }
      );
    }

    const expiresAt = account.password_reset_expires_at
      ? new Date(account.password_reset_expires_at).getTime()
      : 0;

    if (!expiresAt || expiresAt < Date.now()) {
      return NextResponse.redirect(
        new URL("/reset-password?error=expired-token", request.url),
        { status: 303 }
      );
    }

    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(account.user_id, {
        password,
      });

    if (authError) {
      console.error("reset-password auth error:", authError);

      return NextResponse.redirect(
        new URL(
          `/reset-password?token=${encodeURIComponent(
            token
          )}&error=update-failed`,
          request.url
        ),
        { status: 303 }
      );
    }

    const { error: clearError } = await supabaseAdmin
      .from("master_accounts")
      .update({
        password_reset_token: null,
        password_reset_expires_at: null,
      })
      .eq("user_id", account.user_id);

    if (clearError) {
      console.error("reset-password clear token error:", clearError);
    }

    return NextResponse.redirect(
      new URL("/login?password-reset=1", request.url),
      { status: 303 }
    );
  } catch (error) {
    console.error("reset-password error:", error);

    return NextResponse.redirect(
      new URL("/reset-password?error=server-error", request.url),
      { status: 303 }
    );
  }
}