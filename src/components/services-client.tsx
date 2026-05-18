"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import type { Service } from "@/types/master";
import {
  getServiceCategoryLabel,
  serviceCategories,
} from "@/lib/service-categories";

type ServicesClientProps = {
  master: {
    slug: string;
    services: Service[];
  };
  updated: boolean;
};

const servicesText = {
  en: {
    dashboardLabel: "Master dashboard",
    title: "Services",
    subtitle: "Add, update, or remove services from your public booking page.",
    dashboard: "Dashboard",
    publicPage: "Public page",
    updated: "Services updated successfully.",
    addNewService: "Add new service",
    serviceName: "Service name",
    serviceNamePlaceholder: "Classic Manicure",
    price: "Price",
    duration: "Duration",
    category: "Category",
    addService: "Add service",
    saveService: "Save service",
    deleteService: "Delete service",
    noServicesYet: "No services yet",
    addFirstService: "Add your first service above.",
  },
  es: {
    dashboardLabel: "Panel del maestro",
    title: "Servicios",
    subtitle:
      "Agrega, actualiza o elimina servicios de tu página pública de reservas.",
    dashboard: "Panel",
    publicPage: "Página pública",
    updated: "Servicios actualizados correctamente.",
    addNewService: "Agregar nuevo servicio",
    serviceName: "Nombre del servicio",
    serviceNamePlaceholder: "Manicura clásica",
    price: "Precio",
    duration: "Duración",
    category: "Categoría",
    addService: "Agregar servicio",
    saveService: "Guardar servicio",
    deleteService: "Eliminar servicio",
    noServicesYet: "Todavía no hay servicios",
    addFirstService: "Agrega tu primer servicio arriba.",
  },
  ru: {
    dashboardLabel: "Кабинет мастера",
    title: "Услуги",
    subtitle:
      "Добавляйте, редактируйте или удаляйте услуги с публичной страницы записи.",
    dashboard: "Кабинет",
    publicPage: "Публичная страница",
    updated: "Услуги успешно обновлены.",
    addNewService: "Добавить новую услугу",
    serviceName: "Название услуги",
    serviceNamePlaceholder: "Классический маникюр",
    price: "Цена",
    duration: "Длительность",
    category: "Категория",
    addService: "Добавить услугу",
    saveService: "Сохранить услугу",
    deleteService: "Удалить услугу",
    noServicesYet: "Услуг пока нет",
    addFirstService: "Добавьте первую услугу выше.",
  },
} satisfies Record<Locale, Record<string, string>>;

function cleanPrice(price: string) {
  return price.replace("$", "").trim();
}

function cleanDuration(duration: string) {
  return duration.replace(" min", "").trim();
}

export function ServicesClient({ master, updated }: ServicesClientProps) {
  const { locale } = useLocale();
  const text = servicesText[locale];

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              {text.dashboardLabel}
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
              {text.title}
            </h1>

            <p className="mt-4 text-neutral-600">{text.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/${master.slug}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.dashboard}
            </Link>

            <Link
              href={`/${master.slug}`}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.publicPage}
            </Link>
          </div>
        </div>

        {updated && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {text.updated}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {text.addNewService}
          </h2>

          <form
            action="/api/add-master-service"
            method="POST"
            className="mt-6 grid gap-4 md:grid-cols-5"
          >
            <input type="hidden" name="slug" value={master.slug} />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.serviceName}
              </label>
              <input
                name="name"
                required
                placeholder={text.serviceNamePlaceholder}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.price}
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
                {text.duration}
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
                {text.category}
              </label>
              <select
                name="category"
                defaultValue="manicure"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                {serviceCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {getServiceCategoryLabel(category.value, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {text.addService}
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
                    {text.serviceName}
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
                    {text.price}
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
                    {text.duration}
                  </label>
                  <input
                    name="durationMinutes"
                    type="number"
                    min="15"
                    step="15"
                    required
                    defaultValue={cleanDuration(service.duration)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {text.category}
                  </label>
                  <select
                    name="category"
                    defaultValue={service.category}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  >
                    {serviceCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {getServiceCategoryLabel(category.value, locale)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    {text.saveService}
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
                  {text.deleteService}
                </button>
              </form>
            </div>
          ))}
        </div>

        {master.services.length === 0 && (
          <div className="mt-8 rounded-3xl border border-neutral-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-neutral-900">
              {text.noServicesYet}
            </h2>
            <p className="mt-3 text-neutral-600">{text.addFirstService}</p>
          </div>
        )}
      </section>
    </main>
  );
}