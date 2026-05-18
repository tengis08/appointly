import { NextResponse } from "next/server";
import { sendContactRequestEmail } from "@/lib/email";
import {
  checkRateLimit,
  cleanupOldRateLimitRows,
  normalizeRateLimitValue,
} from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

type ContactRequestPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  turnstileToken?: string;
};

function getString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestPayload;

    const name = getString(body.name);
    const email = getString(body.email).toLowerCase();
    const phone = getString(body.phone);
    const message = getString(body.message);
    const turnstileToken = getString(body.turnstileToken);

    const clientIp = getClientIp(request) || "unknown-ip";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { error: "Name is too long." },
        { status: 400 }
      );
    }

    if (email.length > 160) {
      return NextResponse.json(
        { error: "Email is too long." },
        { status: 400 }
      );
    }

    if (phone.length > 40) {
      return NextResponse.json(
        { error: "Phone is too long." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 }
      );
    }

    const ipRateLimit = await checkRateLimit({
      key: `contact:ip:${normalizeRateLimitValue(clientIp)}`,
      limit: 5,
      windowSeconds: 60 * 60,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many contact requests. Please try again later." },
        { status: 429 }
      );
    }

    const emailRateLimit = await checkRateLimit({
      key: `contact:email:${normalizeRateLimitValue(email)}`,
      limit: 3,
      windowSeconds: 60 * 60,
    });

    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many contact requests. Please try again later." },
        { status: 429 }
      );
    }

    cleanupOldRateLimitRows().catch((error) => {
      console.error("contact-request rate limit cleanup failed:", error);
    });

    const turnstilePassed = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: clientIp,
    });

    if (!turnstilePassed) {
      return NextResponse.json(
        {
          error: "Security check failed. Please refresh the page and try again.",
        },
        { status: 403 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("contact_requests")
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message: message || null,
        },
      ]);

    if (insertError) {
      console.error("contact-request insert error:", insertError);

      return NextResponse.json(
        { error: "Could not save contact request." },
        { status: 500 }
      );
    }

    const contactToEmail = process.env.CONTACT_TO_EMAIL;

    if (!contactToEmail) {
      console.error("Missing CONTACT_TO_EMAIL environment variable.");

      return NextResponse.json(
        { error: "Contact notification email is not configured." },
        { status: 500 }
      );
    }

    await sendContactRequestEmail({
      to: contactToEmail,
      name,
      email,
      phone: phone || null,
      message: message || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("contact-request unexpected error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}