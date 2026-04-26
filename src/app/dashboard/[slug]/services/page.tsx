import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMasterFromDb } from "@/lib/masters-db";
import { requireMasterAccess } from "@/lib/master-auth";

export const dynamic = "force-dynamic";

type ServicesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

const categories = [
  "manicure",
  "pedicure",
  "lashes",
  "brows",
  "haircut",
  "hair coloring",
  "massage",
  "skincare",
  "makeup",
  "waxing",
];

function cleanPrice(price: string) {
  return price.replace("$", "").trim();
}

export default async function MasterServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
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
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Master dashboard
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
                Services
              </h1>

              <p className="mt-4 text-neutral-600">
                Add, update, or remove services from your public booking page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/${master.slug}`}
                className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Dashboard
              </Link>

              <Link
                href={`/${master.slug}`}
                className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Public page
              </Link>
            </div>
          </div>

          {updated && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              Services updated successfully.
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Add new service
            </h2>

            <form
              action="/api/add-master-service"
              method="POST"
              className="mt-6 grid gap-4 md:grid-cols-5"
            >
              <input type="hidden" name="slug" value={master.slug} />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Service name
                </label>
                <input
                  name="name"
                  required
                  placeholder="Classic Manicure"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Price
                </label>
                <input
                  name="price"
                  required
                  placeholder="45"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Duration
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="15"
                  step="15"
                  defaultValue="60"
                  required
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="manicure"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-5">
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Add service
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 space-y-6">
            {master.services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-neutral-200 p-6"
              >
                <form
                  action="/api/update-master-service"
                  method="POST"
                  className="grid gap-4 md:grid-cols-5"
                >
                  <input type="hidden" name="slug" value={master.slug} />
                  <input type="hidden" name="serviceId" value={service.id} />

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Service name
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={service.name}
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Price
                    </label>
                    <input
                      name="price"
                      required
                      defaultValue={cleanPrice(service.price)}
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Duration
                    </label>
                    <input
                      name="durationMinutes"
                      type="number"
                      min="15"
                      step="15"
                      required
                      defaultValue={service.duration.replace(" min", "")}
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Category
                    </label>
                    <select
                      name="category"
                      defaultValue={service.category}
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Save service
                    </button>
                  </div>
                </form>

                <form
                  action="/api/delete-master-service"
                  method="POST"
                  className="mt-3"
                >
                  <input type="hidden" name="slug" value={master.slug} />
                  <input type="hidden" name="serviceId" value={service.id} />

                  <button
                    type="submit"
                    className="rounded-full border border-red-300 px-6 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Delete service
                  </button>
                </form>
              </div>
            ))}
          </div>

          {master.services.length === 0 && (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No services yet
              </h2>
              <p className="mt-3 text-neutral-600">
                Add your first service above.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}