import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "Cancel token is required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("cancel_token", token)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.redirect(
      new URL(`/cancel/${token}?cancelled=1`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL(`/cancel/${token}?cancelled=1`, request.url),
    { status: 303 }
  );
}