import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import AdminAnalyticsClient from "@/components/admin-analytics-client";
import { requireAdminAccess } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getAnalyticsDateRange,
  normalizeAnalyticsGroup,
  normalizeAnalyticsPeriod,
  normalizeAnalyticsSort,
  normalizeDateInput,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

type AdminAnalyticsPageProps = {
  searchParams: Promise<{
    country?: string;
    city?: string;
    master?: string;
    category?: string;
    period?: string;
    group?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }>;
};

type AppointmentRow = {
  id: number | string;
  master_slug: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  status: string | null;
  service_price_at_booking: number | string | null;
};

type MasterRow = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
};

type ServiceRow = {
  master_slug: string;
  name: string;
  category: string | null;
};

function getServiceCategory(params: {
  serviceMap: Map<string, string>;
  masterSlug: string;
  serviceName: string;
}) {
  return (
    params.serviceMap.get(`${params.masterSlug}::${params.serviceName}`) ||
    "Uncategorized"
  );
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => String(value || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  await requireAdminAccess();

  const params = await searchParams;
  const selectedCountry = String(params.country || "").trim();
  const selectedCity = String(params.city || "").trim();
  const selectedMaster = String(params.master || "").trim();
  const selectedCategory = String(params.category || "").trim();
  const selectedPeriod = normalizeAnalyticsPeriod(params.period);
  const selectedGroup = normalizeAnalyticsGroup(params.group);
  const selectedSort = normalizeAnalyticsSort(params.sort);
  const selectedStartDate = normalizeDateInput(params.startDate);
  const selectedEndDate = normalizeDateInput(params.endDate);
  const dateRange = getAnalyticsDateRange({
    period: selectedPeriod,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
  });

  const { data: mastersData, error: mastersError } = await supabaseAdmin
    .from("masters")
    .select("slug, name, country, city")
    .order("name", { ascending: true });

  if (mastersError) {
    throw new Error(mastersError.message);
  }

  const masters = (mastersData || []) as MasterRow[];

  const countries = uniqueSorted(masters.map((master) => master.country));

  const citySource = selectedCountry
    ? masters.filter((master) => master.country === selectedCountry)
    : masters;

  const cities = uniqueSorted(citySource.map((master) => master.city));

  const locationFilteredMasters = masters.filter((master) => {
    const countryMatches = selectedCountry
      ? master.country === selectedCountry
      : true;

    const cityMatches = selectedCity ? master.city === selectedCity : true;

    return countryMatches && cityMatches;
  });

  const locationFilteredSlugs = locationFilteredMasters.map(
    (master) => master.slug
  );

  const { data: servicesData, error: servicesError } = await supabaseAdmin
    .from("master_services")
    .select("master_slug, name, category")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (servicesError) {
    throw new Error(servicesError.message);
  }

  const services = (servicesData || []) as ServiceRow[];
  const serviceMap = new Map(
    services.map((service) => [
      `${service.master_slug}::${service.name}`,
      service.category || "Uncategorized",
    ])
  );

  let appointments: AppointmentRow[] = [];

  const shouldQueryAppointments =
    Boolean(selectedMaster) ||
    (!selectedCountry && !selectedCity) ||
    locationFilteredSlugs.length > 0;

  if (shouldQueryAppointments) {
    let appointmentsQuery = supabaseAdmin
      .from("appointments")
      .select(
        "id, master_slug, appointment_date, appointment_time, service_name, status, service_price_at_booking"
      )
      .in("status", ["active", "cancelled"]);

    if (selectedMaster) {
      appointmentsQuery = appointmentsQuery.eq("master_slug", selectedMaster);
    } else if (selectedCountry || selectedCity) {
      appointmentsQuery = appointmentsQuery.in("master_slug", locationFilteredSlugs);
    }

    if (dateRange.startDate) {
      appointmentsQuery = appointmentsQuery.gte(
        "appointment_date",
        dateRange.startDate
      );
    }

    if (dateRange.endDate) {
      appointmentsQuery = appointmentsQuery.lte(
        "appointment_date",
        dateRange.endDate
      );
    }

    const { data: appointmentsData, error: appointmentsError } =
      await appointmentsQuery
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

    if (appointmentsError) {
      throw new Error(appointmentsError.message);
    }

    appointments = (appointmentsData || []) as AppointmentRow[];
  }

  if (selectedCategory) {
    appointments = appointments.filter(
      (appointment) =>
        getServiceCategory({
          serviceMap,
          masterSlug: appointment.master_slug,
          serviceName: appointment.service_name,
        }) === selectedCategory
    );
  }

  const categorySet = new Set<string>();

  for (const service of services) {
    categorySet.add(service.category || "Uncategorized");
  }

  for (const appointment of appointments) {
    categorySet.add(
      getServiceCategory({
        serviceMap,
        masterSlug: appointment.master_slug,
        serviceName: appointment.service_name,
      })
    );
  }

  const categories = Array.from(categorySet).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <AdminAnalyticsClient
        appointments={appointments}
        masters={masters}
        services={services}
        categories={categories}
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        selectedMaster={selectedMaster}
        selectedCategory={selectedCategory}
        selectedPeriod={selectedPeriod}
        selectedGroup={selectedGroup}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        selectedSort={selectedSort}
      />

      <Footer />
    </div>
  );
}
