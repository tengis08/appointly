import { supabaseAdmin } from "@/lib/supabase-admin";
import { canAcceptBookings } from "@/lib/subscription";

type MasterRow = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  show_in_directory: boolean | null;
};

type ServiceRow = {
  master_slug: string;
  category: string;
};

type AccountRow = {
  master_slug: string;
  plan_type: string | null;
  subscription_status: string | null;
};

type PublicMasterListItem = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  categories: string[];
  planType: string | null;
  showInDirectory: boolean;
};

function getPlanRank(planType: string | null | undefined) {
  if (planType === "premium") return 0;
  if (planType === "basic") return 1;
  return 2;
}

function buildMastersList(
  masters: MasterRow[],
  services: ServiceRow[],
  accountBySlug?: Map<string, AccountRow>
) {
  const serviceMap = new Map<string, Set<string>>();

  services.forEach((service) => {
    if (!serviceMap.has(service.master_slug)) {
      serviceMap.set(service.master_slug, new Set());
    }

    serviceMap.get(service.master_slug)!.add(service.category);
  });

  return masters.map((master) => {
    const account = accountBySlug?.get(master.slug);

    return {
      slug: master.slug,
      name: master.name,
      country: master.country,
      city: master.city,
      neighborhood: master.neighborhood,
      showInDirectory: master.show_in_directory !== false,
      categories: Array.from(serviceMap.get(master.slug) || []),
      planType: account?.plan_type || null,
    };
  });
}

export async function getMastersListFromDb() {
  const { data: masters, error: mastersError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, country, city, neighborhood, show_in_directory")
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

  return buildMastersList(
    (masters || []) as MasterRow[],
    (services || []) as ServiceRow[]
  );
}

export async function getPublicMastersListFromDb() {
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug, plan_type, subscription_status");

  if (accountsError) {
    throw new Error(accountsError.message);
  }

  const publicAccounts = ((accounts || []) as AccountRow[]).filter((account) =>
    canAcceptBookings({
      planType: account.plan_type,
      subscriptionStatus: account.subscription_status,
    })
  );

  const activeSlugs = Array.from(
    new Set(publicAccounts.map((account) => account.master_slug))
  );

  if (activeSlugs.length === 0) {
    return [];
  }

  const accountBySlug = new Map(
    publicAccounts.map((account) => [account.master_slug, account])
  );

  const { data: masters, error: mastersError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, country, city, neighborhood, show_in_directory")
    .in("slug", activeSlugs);

  if (mastersError) {
    throw new Error(mastersError.message);
  }

  const { data: services, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("master_slug, category")
    .in("master_slug", activeSlugs);

  if (servicesError) {
    throw new Error(servicesError.message);
  }

  const list = (buildMastersList(
    (masters || []) as MasterRow[],
    (services || []) as ServiceRow[],
    accountBySlug
  ) as PublicMasterListItem[]).filter((master) => {
    if (master.planType !== "premium") {
      return true;
    }

    return master.showInDirectory;
  });

  return list.sort((a, b) => {
    const planDifference = getPlanRank(a.planType) - getPlanRank(b.planType);

    if (planDifference !== 0) {
      return planDifference;
    }

    return a.name.localeCompare(b.name);
  });
}
