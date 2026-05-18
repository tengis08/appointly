import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
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
    .select("master_slug")
    .eq("user_id", user.id)
    .single();

  if (accountError || !account || account.master_slug !== slug) {
    return NextResponse.json(
      { error: "You do not have access to this profile." },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("master_accounts")
    .update({
      telegram_chat_id: null,
      telegram_connect_token: null,
      telegram_connect_expires_at: null,
      telegram_connected_at: null,
      telegram_notifications_enabled: false,
    })
    .eq("master_slug", slug)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}/settings?updated=1`, request.url),
    { status: 303 }
  );
}
