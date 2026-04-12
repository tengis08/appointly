"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { useLocale } from "./locale-provider";

export function Header() {
  const { t } = useLocale();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
          {t.brand}
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
            {t.login}
          </button>
          <button className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
            {t.getStarted}
          </button>
        </div>
      </div>
    </header>
  );
}