import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const AVATAR_BUCKET = "master-avatars";
const MAX_AVATAR_BYTES = 1024 * 1024; // 1 MB after browser compression
const AVATAR_CONTENT_TYPE = "image/webp";

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
    const avatar = formData.get("avatar");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const access = await verifyMasterAccess(slug);

    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    if (!(avatar instanceof File)) {
      return NextResponse.json(
        { error: "Avatar file is required." },
        { status: 400 }
      );
    }

    if (avatar.type !== AVATAR_CONTENT_TYPE) {
      return NextResponse.json(
        { error: "Avatar must be a compressed WebP image." },
        { status: 400 }
      );
    }

    if (avatar.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Avatar file must be less than 1 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await avatar.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const objectPath = `${slug}/avatar.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, fileBuffer, {
        contentType: AVATAR_CONTENT_TYPE,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("upload-master-avatar storage error:", uploadError);

      return NextResponse.json(
        {
          error:
            "Could not upload avatar. Check that the master-avatars bucket exists in Supabase Storage.",
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(objectPath);

    const photoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabaseAdmin
      .from("masters")
      .update({ photo_url: photoUrl })
      .eq("slug", slug);

    if (updateError) {
      console.error("upload-master-avatar update error:", updateError);

      return NextResponse.json(
        { error: "Avatar uploaded, but profile update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error("upload-master-avatar unexpected error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
