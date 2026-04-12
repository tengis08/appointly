"use client";

import { defaultLocale, type Locale } from "./translations";

const STORAGE_KEY = "appointly-locale";

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "en" || value === "es" || value === "ru") return value;

  return defaultLocale;
}

export function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
}