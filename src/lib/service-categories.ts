import type { Locale } from "@/lib/translations";

export type ServiceCategory = {
  value: string;
  labels: Record<Locale, string>;
};

export const serviceCategories: ServiceCategory[] = [
  {
    value: "manicure",
    labels: {
      en: "Manicure",
      es: "Manicura",
      ru: "Маникюр",
    },
  },
  {
    value: "pedicure",
    labels: {
      en: "Pedicure",
      es: "Pedicura",
      ru: "Педикюр",
    },
  },
  {
    value: "lashes",
    labels: {
      en: "Lashes",
      es: "Pestañas",
      ru: "Ресницы",
    },
  },
  {
    value: "brows",
    labels: {
      en: "Brows",
      es: "Cejas",
      ru: "Брови",
    },
  },
  {
    value: "haircut",
    labels: {
      en: "Haircut",
      es: "Corte de pelo",
      ru: "Стрижка",
    },
  },
  {
    value: "hair coloring",
    labels: {
      en: "Hair coloring",
      es: "Coloración",
      ru: "Окрашивание",
    },
  },
  {
    value: "massage",
    labels: {
      en: "Massage",
      es: "Masaje",
      ru: "Массаж",
    },
  },
  {
    value: "skincare",
    labels: {
      en: "Skincare",
      es: "Cuidado facial",
      ru: "Уход за кожей",
    },
  },
  {
    value: "makeup",
    labels: {
      en: "Makeup",
      es: "Maquillaje",
      ru: "Макияж",
    },
  },
  {
    value: "waxing",
    labels: {
      en: "Waxing",
      es: "Depilación",
      ru: "Депиляция",
    },
  },
  {
    value: "consultation",
    labels: {
      en: "Consultation",
      es: "Consulta",
      ru: "Консультация",
    },
  },
  {
    value: "repair",
    labels: {
      en: "Repair",
      es: "Reparación",
      ru: "Ремонт",
    },
  },
  {
    value: "other",
    labels: {
      en: "Other",
      es: "Otro",
      ru: "Другое",
    },
  },
];

export function getServiceCategoryLabel(category: string, locale: Locale) {
  const normalized = category.trim().toLowerCase();

  const found = serviceCategories.find((item) => item.value === normalized);

  return found?.labels[locale] || category;
}