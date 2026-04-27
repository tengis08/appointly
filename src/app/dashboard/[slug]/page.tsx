import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { requireMasterAccess } from "@/lib/master-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type MasterDashboardPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    date?: string;
    sort?: string;
  }>;
};

export default async function MasterDashboardPage({
  params,
  searchParams,
}: MasterDashboardPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const selectedDate = queryParams.date || "";
  const selectedSort = queryParams.sort === "oldest" ? "oldest" : "newest";

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("slug, name")
    .eq("slug", slug)
    .single();

  if (!master) {
    notFound();
  }

  let appointmentsQuery = supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("master_slug", slug)
    .neq("status", "cancelled");

  if (selectedDate) {
    appointmentsQuery = appointmentsQuery.eq("appointment_date", selectedDate);
  }

  appointmentsQuery =
    selectedSort === "oldest"
      ? appointmentsQuery
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
      : appointmentsQuery
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });

  const { data: appointments } = await appointmentsQuery;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-medium text-neutral-500">
            Master dashboard
          </p>

          <h1 className="mt-2 text-5xl font-bold tracking-tight text-neutral-900">
            {master.name}
          </h1>

          <p className="mt-5 text-lg text-neutral-600">
            View your active booking requests.
          </p>

          <div className="mt-10 rounded-3xl border border-neutral-200 p-6">
            <form className="flex flex-wrap items-end gap-4" method="GET">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="rounded-2xl border border-neutral-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Sort
                </label>

                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="rounded-2xl border border-neutral-300 px-4 py-3"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

              <button className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
                Apply filters
              </button>

              <Link
                href={`/dashboard/${slug}`}
                className="rounded-full border border-neutral-300 px-8 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                Reset
              </Link>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${slug}`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Open public page
              </Link>

              <Link
                href={`/dashboard/${slug}/settings`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Settings
              </Link>

              <Link
                href={`/dashboard/${slug}/services`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Services
              </Link>

              <Link
                href={`/dashboard/${slug}/availability`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Availability
              </Link>

              <Link
                href={`/dashboard/${slug}/billing`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Billing
              </Link>

              <form action="/api/logout-master" method="POST">
                <button className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100">
                  Logout
                </button>
              </form>
            </div>

            <p className="mt-6 text-sm text-neutral-500">
              Active records: {appointments?.length || 0}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Time</th>
                  <th className="px-5 py-4 font-semibold">Service</th>
                  <th className="px-5 py-4 font-semibold">Client</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                </tr>
              </thead>

              <tbody>
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-5 py-4">
                        {appointment.appointment_date}
                      </td>
                      <td className="px-5 py-4">
                        {appointment.appointment_time}
                      </td>
                      <td className="px-5 py-4">
                        {appointment.service_name}
                      </td>
                      <td className="px-5 py-4">
                        {appointment.client_name}
                      </td>
                      <td className="px-5 py-4">
                        {appointment.client_phone}
                      </td>
                      <td className="px-5 py-4">
                        {appointment.client_email}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-neutral-500"
                    >
                      No active appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}