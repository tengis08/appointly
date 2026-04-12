"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <p>{t.footerText}</p>

        <p>
          {t.createdBy}{" "}
          <Link
            href="/tengis"
            className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
          >
            Tengis
          </Link>
        </p>
      </div>
    </footer>
  );
}