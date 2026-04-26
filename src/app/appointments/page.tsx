import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { masters } from "@/data/masters";
import { formatTimeLabel } from "@/lib/booking";
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
  id: number;
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
      ? query.order("appointment_date", { ascending: true }).order(
          "appointment_time",
          { ascending: true }
        )
      : query.order("appointment_date", { ascending: false }).order(
          "appointment_time",
          { ascending: false }
        );

  const { data, error } = await query;

  const appointments = (data ?? []) as AppointmentRow[];
  const masterEntries = Object.values(masters).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Appointments
            </h1>

            <p className="mt-4 text-lg leading-8 text-neutral-600">
              Internal page for viewing booking requests.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
            <form method="GET" className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Master
                </label>
                <select
                  name="master"
                  defaultValue={selectedMaster}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  <option value="">All masters</option>
                  {masterEntries.map((master) => (
                    <option key={master.slug} value={master.slug}>
                      {master.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Sort
                </label>
                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Apply filters
                </button>

                <Link
                  href="/appointments"
                  className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  Reset
                </Link>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-neutral-600">
                Total records:{" "}
                <span className="font-semibold text-neutral-900">
                  {appointments.length}
                </span>
              </div>

              <Link
                href="/masters"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Back to masters
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-xl font-semibold text-red-700">
                Failed to load appointments
              </h2>
              <p className="mt-2 text-sm text-red-600">{error.message}</p>
            </div>
          )}

          {!error && appointments.length === 0 && (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No appointments found
              </h2>
              <p className="mt-3 text-neutral-600">
                Try changing the filters or wait for new booking requests.
              </p>
            </div>
          )}

          {!error && appointments.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-neutral-50">
                    <tr className="text-left text-sm text-neutral-700">
                      <th className="px-4 py-4 font-semibold">Master</th>
                      <th className="px-4 py-4 font-semibold">Service</th>
                      <th className="px-4 py-4 font-semibold">Date</th>
                      <th className="px-4 py-4 font-semibold">Time</th>
                      <th className="px-4 py-4 font-semibold">Client</th>
                      <th className="px-4 py-4 font-semibold">Phone</th>
                      <th className="px-4 py-4 font-semibold">Email</th>
                      <th className="px-4 py-4 font-semibold">Profile</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment) => {
                      const master = masters[appointment.master_slug];
                      const masterName = master?.name ?? appointment.master_slug;

                      return (
                        <tr
                          key={appointment.id}
                          className="border-t border-neutral-200 text-sm text-neutral-800"
                        >
                          <td className="px-4 py-4 font-medium">{masterName}</td>
                          <td className="px-4 py-4">{appointment.service_name}</td>
                          <td className="px-4 py-4">{appointment.appointment_date}</td>
                          <td className="px-4 py-4">
                            {formatTimeLabel(appointment.appointment_time)}
                          </td>
                          <td className="px-4 py-4">{appointment.client_name}</td>
                          <td className="px-4 py-4">
                            {appointment.client_phone || "-"}
                          </td>
                          <td className="px-4 py-4">{appointment.client_email}</td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/${appointment.master_slug}`}
                              className="font-medium text-neutral-900 underline underline-offset-4"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}