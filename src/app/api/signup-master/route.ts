import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SignupPayload = {
  email: string;
  password: string;
  slug: string;
  name: string;
  bookingEmail: string;
  phone?: string;
  city?: string;
  neighborhood?: string;
  about?: string;
  serviceName: string;
  servicePrice: string;
  serviceDurationMinutes: number;
  serviceCategory: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const slug = normalizeSlug(body.slug);
    const name = body.name?.trim();
    const bookingEmail = body.bookingEmail?.trim().toLowerCase();

    if (!email || !password || !slug || !name || !bookingEmail) {
      return Response.json(
        { error: "Email, password, slug, name, and booking email are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (!body.serviceName || !body.servicePrice || !body.serviceCategory) {
      return Response.json(
        { error: "First service name, price, and category are required." },
        { status: 400 }
      );
    }

    if (!body.serviceDurationMinutes || body.serviceDurationMinutes < 15) {
      return Response.json(
        { error: "Service duration must be at least 15 minutes." },
        { status: 400 }
      );
    }

    const { data: existingMaster } = await supabaseAdmin
      .from("masters")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existingMaster) {
      return Response.json(
        { error: "This page slug is already taken." },
        { status: 409 }
      );
    }

    const { data: userResult, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError || !userResult.user) {
      return Response.json(
        { error: userError?.message || "Could not create user." },
        { status: 500 }
      );
    }

    const userId = userResult.user.id;

    const { error: masterError } = await supabaseAdmin.from("masters").insert([
      {
        slug,
        name,
        about: body.about || null,
        phone: body.phone || null,
        whatsapp: body.phone || null,
        address: null,
        city: body.city || null,
        neighborhood: body.neighborhood || null,
        photo_url: null,
        booking_email: bookingEmail,
        slot_step_minutes: 30,
      },
    ]);

    if (masterError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return Response.json(
        { error: masterError.message },
        { status: 500 }
      );
    }

    const { error: accountError } = await supabaseAdmin
      .from("master_accounts")
      .insert([
        {
          user_id: userId,
          master_slug: slug,
          email,
        },
      ]);

    if (accountError) {
      await supabaseAdmin.from("masters").delete().eq("slug", slug);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return Response.json(
        { error: accountError.message },
        { status: 500 }
      );
    }

    const { error: serviceError } = await supabaseAdmin
      .from("master_services")
      .insert([
        {
          master_slug: slug,
          name: body.serviceName.trim(),
          price: body.servicePrice.trim(),
          duration_minutes: body.serviceDurationMinutes,
          category: body.serviceCategory.trim().toLowerCase(),
        },
      ]);

    if (serviceError) {
      await supabaseAdmin.from("masters").delete().eq("slug", slug);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return Response.json(
        { error: serviceError.message },
        { status: 500 }
      );
    }

    const { error: workingDaysError } = await supabaseAdmin
      .from("master_working_days")
      .insert([
        { master_slug: slug, day_of_week: 1, start_time: "10:00", end_time: "18:00" },
        { master_slug: slug, day_of_week: 2, start_time: "10:00", end_time: "18:00" },
        { master_slug: slug, day_of_week: 3, start_time: "10:00", end_time: "18:00" },
        { master_slug: slug, day_of_week: 4, start_time: "10:00", end_time: "18:00" },
        { master_slug: slug, day_of_week: 5, start_time: "10:00", end_time: "18:00" },
        { master_slug: slug, day_of_week: 6, start_time: "10:00", end_time: "18:00" },
      ]);

    if (workingDaysError) {
      await supabaseAdmin.from("masters").delete().eq("slug", slug);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return Response.json(
        { error: workingDaysError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      slug,
      publicUrl: `/${slug}`,
      dashboardUrl: `/dashboard/${slug}`,
    });
  } catch (error) {
    console.error("signup-master error:", error);

    return Response.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}