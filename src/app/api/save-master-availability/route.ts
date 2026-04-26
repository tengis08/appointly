import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getLoggedMasterSlug() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user) return null;

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug")
    .eq("user_id", user.id)
    .single();

  return account?.master_slug || null;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const slug = String(formData.get("slug") || "").trim();

  const loggedMasterSlug = await getLoggedMasterSlug();

  if (!loggedMasterSlug || loggedMasterSlug !== slug) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await supabaseAdmin.from("master_working_days").delete().eq("master_slug", slug);

  for (let day = 0; day <= 6; day++) {
    const enabled = formData.get(`enabled_${day}`) === "on";
    const start = String(formData.get(`start_${day}`) || "");
    const end = String(formData.get(`end_${day}`) || "");

    if (!enabled) continue;

    await supabaseAdmin.from("master_working_days").insert({
      master_slug: slug,
      day_of_week: day,
      start_time: start,
      end_time: end,
    });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}/availability?saved=1`, request.url),
    { status: 303 }
  );
}