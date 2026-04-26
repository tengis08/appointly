import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const formData = await request.formData();

  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const about = String(formData.get("about") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const bookingEmail = String(formData.get("bookingEmail") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const neighborhood = String(formData.get("neighborhood") || "").trim();
  const slotStepMinutes = Number(formData.get("slotStepMinutes") || 30);

  if (!slug || !name || !bookingEmail) {
    return NextResponse.json(
      { error: "Slug, name, and booking email are required." },
      { status: 400 }
    );
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
    .from("masters")
    .update({
      name,
      about: about || null,
      phone: phone || null,
      whatsapp: phone || null,
      booking_email: bookingEmail,
      city: city || null,
      neighborhood: neighborhood || null,
      slot_step_minutes: slotStepMinutes,
    })
    .eq("slug", slug);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${slug}/settings?updated=1`, request.url),
    { status: 303 }
  );
}