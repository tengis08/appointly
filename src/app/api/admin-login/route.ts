import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createAdminSessionToken,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";
import {
  checkRateLimit,
  cleanupOldRateLimitRows,
  normalizeRateLimitValue,
} from "@/lib/rate-limit";

function timingSafeEqualString(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const turnstileToken = String(formData.get("turnstileToken") || "");

    const clientIp = getClientIp(request) || "unknown-ip";

    const ipRateLimit = await checkRateLimit({
      key: `admin-login:ip:${normalizeRateLimitValue(clientIp)}`,
      limit: 5,
      windowSeconds: 60 * 60,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.redirect(
        new URL("/appointments-login?error=1", request.url),
        { status: 303 }
      );
    }

    cleanupOldRateLimitRows().catch((error) => {
      console.error("admin-login rate limit cleanup failed:", error);
    });

    const turnstilePassed = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: clientIp,
    });

    if (!turnstilePassed) {
      return NextResponse.redirect(
        new URL("/appointments-login?error=1", request.url),
        { status: 303 }
      );
    }

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      console.error("Missing ADMIN_USERNAME or ADMIN_PASSWORD.");
      return NextResponse.redirect(
        new URL("/appointments-login?error=1", request.url),
        { status: 303 }
      );
    }

    const usernameOk = timingSafeEqualString(username, expectedUsername);
    const passwordOk = timingSafeEqualString(password, expectedPassword);

    if (!usernameOk || !passwordOk) {
      return NextResponse.redirect(
        new URL("/appointments-login?error=1", request.url),
        { status: 303 }
      );
    }

    const token = createAdminSessionToken(username);
    await setAdminSessionCookie(token);

    return NextResponse.redirect(new URL("/appointments", request.url), {
      status: 303,
    });
  } catch (error) {
    console.error("admin-login unexpected error:", error);

    return NextResponse.redirect(
      new URL("/appointments-login?error=1", request.url),
      { status: 303 }
    );
  }
}