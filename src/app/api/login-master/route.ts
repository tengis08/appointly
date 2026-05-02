import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(
        new URL("/login?error=missing-fields", request.url),
        { status: 303 }
      );
    }

    const { data: signInData, error: signInError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.session || !signInData.user) {
      console.error("login-master sign in error:", signInError);

      return NextResponse.redirect(
        new URL("/login?error=invalid-login", request.url),
        { status: 303 }
      );
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .select("master_slug")
      .eq("user_id", signInData.user.id)
      .maybeSingle();

    if (accountError) {
      console.error("login-master account error:", accountError);

      return NextResponse.redirect(
        new URL("/login?error=server-error", request.url),
        { status: 303 }
      );
    }

    if (!account?.master_slug) {
      console.error("login-master no master account found for user:", {
        userId: signInData.user.id,
        email,
      });

      return NextResponse.redirect(
        new URL("/login?error=invalid-login", request.url),
        { status: 303 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("appointly_access_token", signInData.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set(
      "appointly_refresh_token",
      signInData.session.refresh_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return NextResponse.redirect(
      new URL(`/dashboard/${account.master_slug}`, request.url),
      { status: 303 }
    );
  } catch (error) {
    console.error("login-master unexpected error:", error);

    return NextResponse.redirect(
      new URL("/login?error=server-error", request.url),
      { status: 303 }
    );
  }
}