"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p>{t.footerText}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link
              href="/terms"
              className="font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
            >
              Privacy
            </Link>

            <Link
              href="/tengis"
              className="font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
            >
              Contact
            </Link>
          </div>
        </div>

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