import { supabaseAdmin } from "@/lib/supabase-admin";

type MasterRow = {
  slug: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
};

type ServiceRow = {
  master_slug: string;
  category: string;
};

export async function getMastersListFromDb() {
  const { data: masters, error: mastersError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, city, neighborhood")
    .order("name", { ascending: true });

  if (mastersError) {
    throw new Error(mastersError.message);
  }

  const { data: services, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("master_slug, category");

  if (servicesError) {
    throw new Error(servicesError.message);
  }

  const serviceMap = new Map<string, Set<string>>();

  (services || []).forEach((s: ServiceRow) => {
    if (!serviceMap.has(s.master_slug)) {
      serviceMap.set(s.master_slug, new Set());
    }
    serviceMap.get(s.master_slug)!.add(s.category);
  });

  return (masters || []).map((m: MasterRow) => ({
    slug: m.slug,
    name: m.name,
    city: m.city,
    neighborhood: m.neighborhood,
    categories: Array.from(serviceMap.get(m.slug) || []),
  }));
}