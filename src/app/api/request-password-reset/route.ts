import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    // Always return success message to avoid revealing whether an email exists.
    const genericRedirect = new URL(
      "/forgot-password?sent=1",
      request.url
    );

    if (!email) {
      return NextResponse.redirect(genericRedirect, { status: 303 });
    }

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
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("master_accounts")
      .update({
        password_reset_token: resetToken,
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

    return NextResponse.redirect(
      new URL("/forgot-password?sent=1", request.url),
      { status: 303 }
    );
  }
}