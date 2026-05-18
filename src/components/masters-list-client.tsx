"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import {
  getServiceCategoryLabel,
  serviceCategories,
} from "@/lib/service-categories";

type MasterListItem = {
  slug: string;
  name: string;
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  categories: string[];
};

type MastersListClientProps = {
  masters: MasterListItem[];
};

const mastersText = {
  en: {
    title: "Find a service provider",
    subtitle: "Browse providers by service, country, city, and neighborhood.",
    searchLabel: "Search",
    searchPlaceholder: "Name, country, city, or neighborhood",
    categoryLabel: "Service category",
    countryLabel: "Country",
    cityLabel: "City",
    neighborhoodLabel: "Neighborhood",
    allCategories: "All categories",
    allCountries: "All countries",
    allCities: "All cities",
    allNeighborhoods: "All neighborhoods",
    clearFilters: "Clear filters",
    showing: "Showing",
    of: "of",
    masters: "providers",
    viewProfile: "View profile",
    noMasters: "No providers found yet.",
    noResults: "No providers match these filters.",
  },
  es: {
    title: "Encuentra un especialista",
    subtitle: "Busca especialistas por servicio, país, ciudad y barrio.",
    searchLabel: "Buscar",
    searchPlaceholder: "Nombre, país, ciudad o barrio",
    categoryLabel: "Categoría de servicio",
    countryLabel: "País",
    cityLabel: "Ciudad",
    neighborhoodLabel: "Barrio",
    allCategories: "Todas las categorías",
    allCountries: "Todos los países",
    allCities: "Todas las ciudades",
    allNeighborhoods: "Todos los barrios",
    clearFilters: "Limpiar filtros",
    showing: "Mostrando",
    of: "de",
    masters: "especialistas",
    viewProfile: "Ver perfil",
    noMasters: "Todavía no hay especialistas.",
    noResults: "No hay especialistas que coincidan con estos filtros.",
  },
  ru: {
    title: "Найти специалиста",
    subtitle: "Ищите специалистов по услуге, стране, городу и району.",
    searchLabel: "Поиск",
    searchPlaceholder: "Имя, страна, город или район",
    categoryLabel: "Категория услуги",
    countryLabel: "Страна",
    cityLabel: "Город",
    neighborhoodLabel: "Район",
    allCategories: "Все категории",
    allCountries: "Все страны",
    allCities: "Все города",
    allNeighborhoods: "Все районы",
    clearFilters: "Сбросить фильтры",
    showing: "Показано",
    of: "из",
    masters: "специалистов",
    viewProfile: "Открыть профиль",
    noMasters: "Специалистов пока нет.",
    noResults: "По этим фильтрам специалисты не найдены.",
  },
} satisfies Record<Locale, Record<string, string>>;

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function getUniqueSortedValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function MastersListClient({ masters }: MastersListClientProps) {
  const { locale } = useLocale();
  const text = mastersText[locale];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  const countries = useMemo(() => {
    return getUniqueSortedValues(masters.map((master) => master.country));
  }, [masters]);

  const cities = useMemo(() => {
    const source = selectedCountry
      ? masters.filter((master) => master.country === selectedCountry)
      : masters;

    return getUniqueSortedValues(source.map((master) => master.city));
  }, [masters, selectedCountry]);

  const neighborhoods = useMemo(() => {
    const source = masters.filter((master) => {
      const matchesCountry = !selectedCountry || master.country === selectedCountry;
      const matchesCity = !selectedCity || master.city === selectedCity;

      return matchesCountry && matchesCity;
    });

    return getUniqueSortedValues(source.map((master) => master.neighborhood));
  }, [masters, selectedCountry, selectedCity]);

  const filteredMasters = useMemo(() => {
    const normalizedSearch = normalize(search);

    return masters.filter((master) => {
      const masterCategories = master.categories || [];

      const matchesSearch =
        !normalizedSearch ||
        normalize(master.name).includes(normalizedSearch) ||
        normalize(master.country).includes(normalizedSearch) ||
        normalize(master.city).includes(normalizedSearch) ||
        normalize(master.neighborhood).includes(normalizedSearch);

      const matchesCategory =
        !selectedCategory || masterCategories.includes(selectedCategory);

      const matchesCountry =
        !selectedCountry || master.country === selectedCountry;

      const matchesCity = !selectedCity || master.city === selectedCity;

      const matchesNeighborhood =
        !selectedNeighborhood || master.neighborhood === selectedNeighborhood;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCountry &&
        matchesCity &&
        matchesNeighborhood
      );
    });
  }, [masters, search, selectedCategory, selectedCountry, selectedCity, selectedNeighborhood]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedNeighborhood("");
  }

  const hasAnyFilter =
    search || selectedCategory || selectedCountry || selectedCity || selectedNeighborhood;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {text.title}
          </h1>

          <p className="mt-3 text-neutral-600">{text.subtitle}</p>

          {masters.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-neutral-200 p-8 text-center text-neutral-600">
              {text.noMasters}
            </div>
          ) : (
            <>
              <div className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto]">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      {text.searchLabel}
                    </label>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={text.searchPlaceholder}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      {text.categoryLabel}
                    </label>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                    >
                      <option value="">{text.allCategories}</option>

                      {serviceCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {getServiceCategoryLabel(category.value, locale)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      {text.countryLabel}
                    </label>

                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedCity("");
                        setSelectedNeighborhood("");
                      }}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                    >
                      <option value="">{text.allCountries}</option>

                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      {text.cityLabel}
                    </label>

                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedNeighborhood("");
                      }}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                    >
                      <option value="">{text.allCities}</option>

                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      {text.neighborhoodLabel}
                    </label>

                    <select
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                    >
                      <option value="">{text.allNeighborhoods}</option>

                      {neighborhoods.map((neighborhood) => (
                        <option key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      disabled={!hasAnyFilter}
                      className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                    >
                      {text.clearFilters}
                    </button>
                  </div>
                </div>

                <p className="mt-5 text-sm text-neutral-600">
                  {text.showing}{" "}
                  <span className="font-semibold text-neutral-900">
                    {filteredMasters.length}
                  </span>{" "}
                  {text.of}{" "}
                  <span className="font-semibold text-neutral-900">
                    {masters.length}
                  </span>{" "}
                  {text.masters}
                </p>
              </div>

              {filteredMasters.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-neutral-200 p-8 text-center text-neutral-600">
                  {text.noResults}
                </div>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {filteredMasters.map((master) => (
                    <div
                      key={master.slug}
                      className="rounded-3xl border border-neutral-200 p-6"
                    >
                      <h2 className="text-xl font-semibold text-neutral-900">
                        {master.name}
                      </h2>

                      <p className="mt-1 text-sm text-neutral-600">
                        {[master.country, master.city, master.neighborhood]
                          .filter(Boolean)
                          .join(" — ") || "-"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {master.categories.length > 0 ? (
                          master.categories.map((category) => (
                            <span
                              key={category}
                              className="rounded-full border border-neutral-300 px-3 py-1 text-xs"
                            >
                              {getServiceCategoryLabel(category, locale)}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500">
                            -
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/${master.slug}`}
                        className="mt-5 inline-block rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        {text.viewProfile}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
