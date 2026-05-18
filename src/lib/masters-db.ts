import type { MasterProfile } from "@/types/master";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeTimeZone } from "@/lib/timezones";

type MasterRow = {
  slug: string;
  name: string;
  about: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  neighborhood: string | null;
  photo_url: string | null;
  booking_email: string | null;
  page_theme: string | null;
  custom_booking_message: string | null;
  booking_policy_text: string | null;
  show_in_directory: boolean | null;

  instagram_url: string | null;
  telegram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  vk_url: string | null;

  slot_step_minutes: number | null;
  booking_window_days: number | null;
};

type ServiceRow = {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
  category: string;
};

type WorkingDayRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

function formatPrice(price: string) {
  const trimmed = price.trim();
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

function normalizeBookingWindowDays(value: number | null | undefined) {
  if (value === 14 || value === 21 || value === 30 || value === 60 || value === 90) {
    return value;
  }

  return 30;
}

export async function getMasterFromDb(
  slug: string
): Promise<MasterProfile | null> {
  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select(
      `
      slug,
      name,
      about,
      phone,
      whatsapp,
      address,
      country,
      city,
      timezone,
      neighborhood,
      photo_url,
      booking_email,
      page_theme,
      custom_booking_message,
      booking_policy_text,
      show_in_directory,
      instagram_url,
      telegram_url,
      facebook_url,
      tiktok_url,
      vk_url,
      slot_step_minutes,
      booking_window_days
      `
    )
    .eq("slug", slug)
    .single();

  if (masterError || !master) {
    return null;
  }

  const { data: services, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("id, name, price, duration_minutes, category")
    .eq("master_slug", slug)
    .order("id", { ascending: true });

  if (servicesError) {
    throw new Error(servicesError.message);
  }

  const { data: workingDays, error: workingDaysError } = await supabaseAdmin
    .from("master_working_days")
    .select("day_of_week, start_time, end_time")
    .eq("master_slug", slug)
    .order("day_of_week", { ascending: true });

  if (workingDaysError) {
    throw new Error(workingDaysError.message);
  }

  const masterRow = master as MasterRow;
  const serviceRows = (services ?? []) as ServiceRow[];
  const workingDayRows = (workingDays ?? []) as WorkingDayRow[];

  const categories = Array.from(
    new Set(serviceRows.map((service) => service.category))
  );

  return {
    slug: masterRow.slug,
    name: masterRow.name,
    about: masterRow.about,
    phone: masterRow.phone,
    whatsapp: masterRow.whatsapp,
    address: masterRow.address,
    country: masterRow.country,
    city: masterRow.city,
    timeZone: normalizeTimeZone(masterRow.timezone),
    neighborhood: masterRow.neighborhood,
    photoUrl: masterRow.photo_url,
    bookingEmail: masterRow.booking_email,
    pageTheme: masterRow.page_theme || "classic",
    customBookingMessage: masterRow.custom_booking_message,
    bookingPolicyText: masterRow.booking_policy_text,
    showInDirectory: masterRow.show_in_directory !== false,

    instagramUrl: masterRow.instagram_url,
    telegramUrl: masterRow.telegram_url,
    facebookUrl: masterRow.facebook_url,
    tiktokUrl: masterRow.tiktok_url,
    vkUrl: masterRow.vk_url,

    publicCategories: categories,
    slotStepMinutes: masterRow.slot_step_minutes || 30,
    bookingWindowDays: normalizeBookingWindowDays(masterRow.booking_window_days),

    workingDays: workingDayRows.map((day) => ({
      dayOfWeek: day.day_of_week,
      start: day.start_time,
      end: day.end_time,
    })),

    services: serviceRows.map((service) => ({
      id: service.id,
      name: service.name,
      price: formatPrice(service.price),
      duration: `${service.duration_minutes} min`,
      category: service.category,
    })),
  };
}