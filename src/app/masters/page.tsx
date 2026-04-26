import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMastersListFromDb } from "@/lib/masters-list-db";

export const dynamic = "force-dynamic";

export default async function MastersPage() {
  const masters = await getMastersListFromDb();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Find a beauty master
          </h1>

          <p className="mt-3 text-neutral-600">
            Browse masters by service, city, and neighborhood.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {masters.map((master) => (
              <div
                key={master.slug}
                className="rounded-3xl border border-neutral-200 p-6"
              >
                <h2 className="text-xl font-semibold text-neutral-900">
                  {master.name}
                </h2>

                <p className="mt-1 text-sm text-neutral-600">
                  {master.city || "-"} — {master.neighborhood || "-"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {master.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/${master.slug}`}
                  className="mt-5 inline-block rounded-full bg-neutral-900 px-4 py-2 text-sm text-white"
                >
                  View profile
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}