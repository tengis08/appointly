"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

const languageOptions: {
  value: Locale;
  label: string;
}[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "ru", label: "Русский" },
];

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {t.brand}
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/masters" className="text-neutral-700 hover:text-black">
              {t.masters}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900"
          >
            {languageOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            {t.login}
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {t.getStarted}
          </Link>
        </div>
      </div>
    </header>
  );
}