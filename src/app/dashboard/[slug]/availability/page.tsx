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

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const loggedMasterSlug = await getLoggedMasterSlug();

  if (!loggedMasterSlug) {
    redirect("/login");
  }

  if (loggedMasterSlug !== slug) {
    redirect(`/dashboard/${loggedMasterSlug}/availability`);
  }

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!master) notFound();

  const { data: workingDays } = await supabaseAdmin
    .from("master_working_days")
    .select("*")
    .eq("master_slug", slug);

  const map: Record<number, { start: string; end: string }> = {};

  for (const row of workingDays || []) {
    map[row.day_of_week] = {
      start: row.start_time,
      end: row.end_time,
    };
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <p className="text-sm text-neutral-500 mb-2">Master settings</p>
        <h1 className="text-5xl font-semibold mb-4">Availability</h1>
        <p className="text-neutral-600 mb-10">
          Set your working days and hours.
        </p>

        <form
          action="/api/save-master-availability"
          method="POST"
          className="border border-neutral-200 rounded-3xl p-8 space-y-6"
        >
          <input type="hidden" name="slug" value={slug} />

          {dayNames.map((dayName, index) => {
            const row = map[index];

            return (
              <div
                key={index}
                className="grid md:grid-cols-4 gap-4 items-center border-b border-neutral-100 pb-4"
              >
                <div className="font-medium">{dayName}</div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`enabled_${index}`}
                    defaultChecked={!!row}
                  />
                  Working day
                </label>

                <input
                  type="time"
                  name={`start_${index}`}
                  defaultValue={row?.start || "10:00"}
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="time"
                  name={`end_${index}`}
                  defaultValue={row?.end || "18:00"}
                  className="border rounded-xl px-4 py-3"
                />
              </div>
            );
          })}

          <div className="flex gap-4 pt-6">
            <button className="bg-black text-white px-8 py-3 rounded-2xl">
              Save availability
            </button>

            <Link
              href={`/dashboard/${slug}`}
              className="border px-8 py-3 rounded-2xl"
            >
              Back to dashboard
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}