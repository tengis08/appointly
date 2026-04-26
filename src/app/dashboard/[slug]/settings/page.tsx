import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMasterFromDb } from "@/lib/masters-db";
import { requireMasterAccess } from "@/lib/master-auth";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export default async function MasterSettingsPage({
  params,
  searchParams,
}: SettingsPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const master = await getMasterFromDb(slug);

  if (!master) {
    notFound();
  }

  const updated = queryParams.updated === "1";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Master settings
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
              Edit profile
            </h1>

            <p className="mt-4 text-neutral-600">
              Update your public booking page information.
            </p>
          </div>

          {updated && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              Profile updated successfully.
            </div>
          )}

          <form
            action="/api/update-master-profile"
            method="POST"
            className="mt-8 space-y-6 rounded-3xl border border-neutral-200 p-6"
          >
            <input type="hidden" name="slug" value={master.slug} />

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Display name
              </label>
              <input
                name="name"
                required
                defaultValue={master.name}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Email for booking notifications
              </label>
              <input
                type="email"
                name="bookingEmail"
                required
                defaultValue={master.bookingEmail || ""}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={master.phone || ""}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  City
                </label>
                <input
                  name="city"
                  defaultValue={master.city || ""}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Neighborhood
                </label>
                <input
                  name="neighborhood"
                  defaultValue={master.neighborhood || ""}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                About
              </label>
              <textarea
                name="about"
                rows={5}
                defaultValue={master.about || ""}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Slot step
              </label>
              <select
                name="slotStepMinutes"
                defaultValue={String(master.slotStepMinutes || 30)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Save profile
              </button>

              <Link
                href={`/dashboard/${master.slug}`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Back to dashboard
              </Link>

              <Link
                href={`/${master.slug}`}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Open public page
              </Link>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}