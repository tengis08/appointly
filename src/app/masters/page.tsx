"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MasterAvatar } from "@/components/master-avatar";
import { masters } from "@/data/masters";

const allMasters = Object.values(masters);

const allCategories = Array.from(
  new Set(allMasters.flatMap((master) => master.publicCategories))
).sort();

const allCities = Array.from(
  new Set(allMasters.map((master) => master.city).filter(Boolean))
).sort() as string[];

const allNeighborhoods = Array.from(
  new Set(allMasters.map((master) => master.neighborhood).filter(Boolean))
).sort() as string[];

export default function MastersPage() {
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const filteredMasters = useMemo(() => {
    return allMasters.filter((master) => {
      const matchesCategory =
        !category || master.publicCategories.includes(category);

      const matchesCity = !city || master.city === city;

      const matchesNeighborhood =
        !neighborhood || master.neighborhood === neighborhood;

      return matchesCategory && matchesCity && matchesNeighborhood;
    });
  }, [category, city, neighborhood]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Find a beauty master
            </h1>

            <p className="mt-4 text-lg leading-8 text-neutral-600">
              Browse masters by service, city, and neighborhood.
            </p>
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-neutral-200 p-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Service category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">All services</option>
                {allCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                City
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setNeighborhood("");
                }}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">All cities</option>
                {allCities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Neighborhood
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="">All neighborhoods</option>
                {allNeighborhoods.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 text-sm text-neutral-600">
            Found:{" "}
            <span className="font-semibold text-neutral-900">
              {filteredMasters.length}
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {filteredMasters.map((master) => (
              <div
                key={master.slug}
                className="rounded-3xl border border-neutral-200 p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <MasterAvatar photoUrl={master.photoUrl} name={master.name} />

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                      {master.name}
                    </h2>

                    {(master.city || master.neighborhood) && (
                      <p className="mt-2 text-sm font-medium text-neutral-700">
                        {[master.city, master.neighborhood]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    )}

                    {master.about && (
                      <p className="mt-3 text-sm leading-6 text-neutral-600">
                        {master.about}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {master.publicCategories.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/${master.slug}`}
                        className="inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMasters.length === 0 && (
            <div className="mt-10 rounded-3xl border border-neutral-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No masters found
              </h2>
              <p className="mt-3 text-neutral-600">
                Try changing the filters.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}