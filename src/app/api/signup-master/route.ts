import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendWelcomeEmail } from "@/lib/email";

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

type SignupPayload = Record<string, unknown>;

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function cleanPhone(value: string) {
  return value.trim();
}

function getPayloadString(payload: SignupPayload, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function getPayloadNumber(
  payload: SignupPayload,
  fallback: number,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const numberValue = Number(value);

      if (!Number.isNaN(numberValue)) {
        return numberValue;
      }
    }
  }

  return fallback;
}

async function readSignupPayload(request: Request): Promise<SignupPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as SignupPayload;
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const formData = await request.formData();
    const payload: SignupPayload = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        payload[key] = value;
      }
    }

    return payload;
  }

  return {};
}

async function signInAndSetCookies(params: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error || !data.session) {
    console.error("signup-master sign-in after signup failed:", error);
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set("appointly_access_token", data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("appointly_refresh_token", data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  let createdMasterSlug: string | null = null;

  try {
    const payload = await readSignupPayload(request);

    const rawSlug = getPayloadString(
      payload,
      "slug",
      "masterSlug",
      "master_slug"
    );

    const slug = cleanSlug(rawSlug);

    const name = getPayloadString(
      payload,
      "name",
      "displayName",
      "display_name"
    );

    const email = cleanEmail(
      getPayloadString(payload, "email", "loginEmail", "login_email")
    );

    const password = getPayloadString(payload, "password");

    const bookingEmail =
      cleanEmail(
        getPayloadString(
          payload,
          "bookingEmail",
          "booking_email",
          "notificationEmail",
          "notification_email"
        )
      ) || email;

    const phone = cleanPhone(getPayloadString(payload, "phone"));
    const whatsapp = cleanPhone(getPayloadString(payload, "whatsapp")) || phone;
    const city = getPayloadString(payload, "city");
    const neighborhood = getPayloadString(payload, "neighborhood");
    const about = getPayloadString(payload, "about");

    const serviceName = getPayloadString(
      payload,
      "serviceName",
      "service_name",
      "firstServiceName",
      "first_service_name"
    );

    const servicePrice = getPayloadString(
      payload,
      "servicePrice",
      "service_price",
      "price"
    );

    const serviceDuration = getPayloadNumber(
      payload,
      60,
      "serviceDuration",
      "service_duration",
      "durationMinutes",
      "duration_minutes"
    );

    const serviceCategory =
      getPayloadString(
        payload,
        "serviceCategory",
        "service_category",
        "category"
      ) || "General";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    if (!slug || !name || !email || !password || !serviceName || !servicePrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const { data: existingMaster } = await supabaseAdmin
      .from("masters")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existingMaster) {
      return NextResponse.json(
        { success: false, error: "This public link is already taken." },
        { status: 409 }
      );
    }

    const { data: existingAccount } = await supabaseAdmin
      .from("master_accounts")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: "This email is already registered." },
        { status: 409 }
      );
    }

    const { data: existingUsers, error: listUsersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      console.error("signup-master list users error:", listUsersError);
    }

    const authUserAlreadyExists = existingUsers?.users?.some(
      (user) => user.email?.toLowerCase() === email
    );

    if (authUserAlreadyExists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This email already exists in authentication. Use another email or reset password.",
        },
        { status: 409 }
      );
    }

    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          master_slug: slug,
          master_name: name,
        },
      });

    if (createUserError || !createdUser.user) {
      console.error("signup-master create user error:", createUserError);

      return NextResponse.json(
        { success: false, error: "Could not create user account." },
        { status: 500 }
      );
    }

    createdUserId = createdUser.user.id;
    createdMasterSlug = slug;

    const { error: masterInsertError } = await supabaseAdmin
      .from("masters")
      .insert([
        {
          slug,
          name,
          about,
          phone,
          whatsapp,
          city,
          neighborhood,
          booking_email: bookingEmail,
          slot_step_minutes: 30,
        },
      ]);

    if (masterInsertError) {
      throw masterInsertError;
    }

    const { error: accountInsertError } = await supabaseAdmin
      .from("master_accounts")
      .insert([
        {
          user_id: createdUser.user.id,
          master_slug: slug,
          email,
          plan_type: "free",
          subscription_status: "inactive",
        },
      ]);

    if (accountInsertError) {
      throw accountInsertError;
    }

    const { error: serviceInsertError } = await supabaseAdmin
      .from("master_services")
      .insert([
        {
          master_slug: slug,
          name: serviceName,
          price: servicePrice,
          duration_minutes: serviceDuration,
          category: serviceCategory,
        },
      ]);

    if (serviceInsertError) {
      throw serviceInsertError;
    }

    const defaultWorkingDays = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      master_slug: slug,
      day_of_week: dayOfWeek,
      start_time: "10:00",
      end_time: "18:00",
    }));

    const { error: workingDaysInsertError } = await supabaseAdmin
      .from("master_working_days")
      .insert(defaultWorkingDays);

    if (workingDaysInsertError) {
      throw workingDaysInsertError;
    }

    try {
      await sendWelcomeEmail({
        to: email,
        masterName: name,
        loginEmail: email,
        publicPageUrl: `${siteUrl}/${slug}`,
        dashboardUrl: `${siteUrl}/dashboard/${slug}`,
        loginUrl: `${siteUrl}/login`,
      });
    } catch (emailError) {
      console.error("signup-master welcome email failed:", emailError);
    }

    await signInAndSetCookies({
      email,
      password,
    });

    return NextResponse.json({
      success: true,
      slug,
      dashboardUrl: `/dashboard/${slug}`,
      publicPageUrl: `/${slug}`,
      master: {
        slug,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("signup-master unexpected error:", error);

    if (createdMasterSlug) {
      await supabaseAdmin
        .from("master_working_days")
        .delete()
        .eq("master_slug", createdMasterSlug);

      await supabaseAdmin
        .from("master_services")
        .delete()
        .eq("master_slug", createdMasterSlug);

      await supabaseAdmin
        .from("master_accounts")
        .delete()
        .eq("master_slug", createdMasterSlug);

      await supabaseAdmin.from("masters").delete().eq("slug", createdMasterSlug);
    }

    if (createdUserId) {
      const { error: deleteUserError } =
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      if (deleteUserError) {
        console.error(
          "signup-master cleanup delete user failed:",
          deleteUserError
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}