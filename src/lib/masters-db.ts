import type { MasterProfile } from "@/types/master";
import { supabaseAdmin } from "@/lib/supabase-admin";

type MasterRow = {
  slug: string;
  name: string;
  about: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  photo_url: string | null;
  booking_email: string | null;
  slot_step_minutes: number;
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

export async function getMasterFromDb(
  slug: string
): Promise<MasterProfile | null> {
  const { data: master, error: masterError } = await supabaseAdmin
    .from("masters")
    .select(
      "slug, name, about, phone, whatsapp, address, city, neighborhood, photo_url, booking_email, slot_step_minutes"
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
    city: masterRow.city,
    neighborhood: masterRow.neighborhood,
    photoUrl: masterRow.photo_url,
    bookingEmail: masterRow.booking_email,
    publicCategories: categories,
    slotStepMinutes: masterRow.slot_step_minutes,
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