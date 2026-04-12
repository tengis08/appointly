"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useLocale } from "@/components/locale-provider";

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700">
              {t.heroBadge}
            </span>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              {t.heroTitle}
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-600">
              {t.heroText}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                {t.createPage}
              </button>
              <button className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
                {t.viewDemo}
              </button>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {t.feature1Title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {t.feature1Text}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {t.feature2Title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {t.feature2Text}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {t.feature3Title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {t.feature3Text}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}