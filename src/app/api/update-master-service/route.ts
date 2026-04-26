import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getLoggedMasterSlug() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user) {
    return null;
  }

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
  const serviceId = Number(formData.get("serviceId"));
  const name = String(formData.get("name") || "").trim();
  const price = String(formData.get("price") || "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") || 60);
  const category = String(formData.get("category") || "").trim().toLowerCase();

  const loggedMasterSlug = await getLoggedMasterSlug();

  if (!loggedMasterSlug || loggedMasterSlug !== slug) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (!serviceId || !name || !price || !category || durationMinutes < 15) {
    return NextResponse.json(
      { error: "Service id, name, price, category, and duration are required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("master_services")
    .update({
      name,
      price,
      duration_minutes: durationMinutes,
      category,
    })
    .eq("id", serviceId)
    .eq("master_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}/services?updated=1`, request.url),
    { status: 303 }
  );
}