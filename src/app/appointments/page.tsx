import { AppointmentsClient } from "@/components/appointments-client";
import { getMastersListFromDb } from "@/lib/masters-list-db";
import { requireAdminAccess } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type AppointmentsPageProps = {
  searchParams: Promise<{
    master?: string;
    date?: string;
    sort?: string;
  }>;
};

type AppointmentRow = {
  id: number | string;
  master_slug: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string | null;
  client_email: string;
};

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  await requireAdminAccess();

  const params = await searchParams;

  const selectedMaster = params.master?.trim() ?? "";
  const selectedDate = params.date?.trim() ?? "";
  const selectedSort = params.sort === "oldest" ? "oldest" : "newest";

  let query = supabaseAdmin
    .from("appointments")
    .select(
      "id, master_slug, service_name, appointment_date, appointment_time, client_name, client_phone, client_email"
    );

  if (selectedMaster) {
    query = query.eq("master_slug", selectedMaster);
  }

  if (selectedDate) {
    query = query.eq("appointment_date", selectedDate);
  }

  query =
    selectedSort === "oldest"
      ? query
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
      : query
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });

  const { data, error } = await query;

  const appointments = (data ?? []) as AppointmentRow[];

  const dbMasters = await getMastersListFromDb();

  const masterEntriesMap = new Map<string, { slug: string; name: string }>();

  for (const master of dbMasters) {
    masterEntriesMap.set(master.slug, {
      slug: master.slug,
      name: master.name,
    });
  }

  for (const appointment of appointments) {
    if (!masterEntriesMap.has(appointment.master_slug)) {
      masterEntriesMap.set(appointment.master_slug, {
        slug: appointment.master_slug,
        name: appointment.master_slug,
      });
    }
  }

  const masterEntries = Array.from(masterEntriesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <AppointmentsClient
      appointments={appointments}
      masterEntries={masterEntries}
      selectedMaster={selectedMaster}
      selectedDate={selectedDate}
      selectedSort={selectedSort}
      errorMessage={error?.message || null}
    />
  );
}