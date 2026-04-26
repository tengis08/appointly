import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Missing Supabase URL or anon key." },
        { status: 500 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey);

    const { data: loginData, error: loginError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !loginData.session || !loginData.user) {
      return NextResponse.json(
        { error: loginError?.message || "Invalid login credentials." },
        { status: 401 }
      );
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .select("master_slug")
      .eq("user_id", loginData.user.id)
      .maybeSingle();

    if (accountError) {
      return NextResponse.json(
        { error: accountError.message },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: "This user exists, but no master account is connected." },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      dashboardUrl: `/dashboard/${account.master_slug}`,
    });

    response.cookies.set("appointly_access_token", loginData.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: loginData.session.expires_in,
    });

    return response;
  } catch (error) {
    console.error("login-master error:", error);

    return NextResponse.json(
      { error: "Unexpected login server error." },
      { status: 500 }
    );
  }
}