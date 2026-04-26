import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getLoggedMasterSlug() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user) return null;

  const { data: account } = await supabaseAdmin
    .from("master_accounts")
    .select("master_slug")
    .eq("user_id", user.id)
    .single();

  return account?.master_slug || null;
}

export default async function MasterDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { date, sort } = await searchParams;

  const loggedMasterSlug = await getLoggedMasterSlug();

  if (!loggedMasterSlug) {
    redirect("/login");
  }

  if (loggedMasterSlug !== slug) {
    redirect(`/dashboard/${loggedMasterSlug}`);
  }

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!master) notFound();

  let query = supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("master_slug", slug);

  if (date) {
    query = query.eq("appointment_date", date);
  }

  if (sort === "oldest") {
    query = query
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });
  } else {
    query = query
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false });
  }

  const { data: appointments } = await query;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-14 w-full">
        <p className="text-sm text-neutral-500 mb-2">Master dashboard</p>
        <h1 className="text-5xl font-semibold mb-4">{master.name}</h1>
        <p className="text-neutral-600 mb-10">View your booking requests.</p>

        <div className="border border-neutral-200 rounded-3xl p-6 mb-8">
          <form className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm block mb-2">Date</label>
              <input
                type="date"
                name="date"
                defaultValue={date || ""}
                className="w-full border rounded-2xl px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm block mb-2">Sort</label>
              <select
                name="sort"
                defaultValue={sort || "newest"}
                className="w-full border rounded-2xl px-4 py-3"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <button className="bg-black text-white px-6 py-3 rounded-2xl">
              Apply filters
            </button>

            <a
              href={`/dashboard/${slug}`}
              className="border px-6 py-3 rounded-2xl text-center"
            >
              Reset
            </a>
          </form>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={`/${slug}`}
              className="border px-5 py-3 rounded-2xl"
            >
              Open public page
            </Link>

            <Link
              href={`/dashboard/${slug}/settings`}
              className="border px-5 py-3 rounded-2xl"
            >
              Settings
            </Link>

            <Link
              href={`/dashboard/${slug}/services`}
              className="border px-5 py-3 rounded-2xl"
            >
              Services
            </Link>

            <Link
              href={`/dashboard/${slug}/availability`}
              className="border px-5 py-3 rounded-2xl"
            >
              Availability
            </Link>

            <a
              href="/api/logout-master"
              className="border px-5 py-3 rounded-2xl"
            >
              Logout
            </a>
          </div>

          <p className="text-sm text-neutral-500 mt-6">
            Total records: {appointments?.length || 0}
          </p>
        </div>

        {!appointments || appointments.length === 0 ? (
          <div className="border border-neutral-200 rounded-3xl p-14 text-center text-neutral-500">
            <h2 className="text-3xl text-black mb-3">No appointments found</h2>
            <p>New booking requests for {master.name} will appear here.</p>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-4 font-semibold">Date</th>
                  <th className="px-4 py-4 font-semibold">Time</th>
                  <th className="px-4 py-4 font-semibold">Service</th>
                  <th className="px-4 py-4 font-semibold">Client</th>
                  <th className="px-4 py-4 font-semibold">Phone</th>
                  <th className="px-4 py-4 font-semibold">Email</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-neutral-200 text-sm"
                  >
                    <td className="px-4 py-4">{appointment.appointment_date}</td>
                    <td className="px-4 py-4">{appointment.appointment_time}</td>
                    <td className="px-4 py-4">{appointment.service_name}</td>
                    <td className="px-4 py-4">{appointment.client_name}</td>
                    <td className="px-4 py-4">{appointment.client_phone}</td>
                    <td className="px-4 py-4">{appointment.client_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}