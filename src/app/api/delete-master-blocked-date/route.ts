import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function verifyMasterAccess(slug: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return { ok: false, status: 401, error: "Not logged in." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return { ok: false, status: 401, error: "Invalid login session." };
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug")
    .eq("user_id", user.id)
    .single();

  if (accountError || !account || account.master_slug !== slug) {
    return { ok: false, status: 403, error: "You do not have access." };
  }

  return { ok: true, status: 200, error: "" };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const slug = String(formData.get("slug") || "").trim();
    const blockedDate = String(formData.get("blockedDate") || "").trim();

    if (!slug || !blockedDate || !isValidDateString(blockedDate)) {
      return NextResponse.json(
        { error: "Slug and valid blocked date are required." },
        { status: 400 }
      );
    }

    const access = await verifyMasterAccess(slug);

    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const { error } = await supabaseAdmin
      .from("master_blocked_dates")
      .delete()
      .eq("master_slug", slug)
      .eq("blocked_date", blockedDate);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(
      new URL(`/dashboard/${slug}/availability?saved=1`, request.url),
      { status: 303 }
    );
  } catch (error) {
    console.error("delete-master-blocked-date unexpected error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}