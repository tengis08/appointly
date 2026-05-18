"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useLocale } from "@/components/locale-provider";
import {
  getServiceCategoryLabel,
  serviceCategories,
} from "@/lib/service-categories";
import {
  defaultTimeZone,
  getTimeZoneLabel,
  masterTimeZones,
  timeZoneText,
} from "@/lib/timezones";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const signupExtraText = {
  en: {
    country: "Country",
    countryPlaceholder: "United States",
    timeZoneHelp: timeZoneText.en.timeZoneHelp,
  },
  es: {
    country: "País",
    countryPlaceholder: "Estados Unidos",
    timeZoneHelp: timeZoneText.es.timeZoneHelp,
  },
  ru: {
    country: "Страна",
    countryPlaceholder: "США",
    timeZoneHelp: timeZoneText.ru.timeZoneHelp,
  },
};

export default function SignupPage() {
  const { locale, t } = useLocale();
  const extraText = signupExtraText[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [timeZone, setTimeZone] = useState(defaultTimeZone);
  const [neighborhood, setNeighborhood] = useState("");
  const [about, setAbout] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDurationMinutes, setServiceDurationMinutes] = useState(60);
  const [serviceCategory, setServiceCategory] = useState("manicure");

  const [turnstileToken, setTurnstileToken] = useState("");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorText, setErrorText] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("loading");
    setErrorText("");
    setCreatedSlug("");

    if (!turnstileToken) {
      setStatus("error");
      setErrorText(t.completeSecurityCheck);
      return;
    }

    try {
      const response = await fetch("/api/signup-master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          slug,
          name,
          bookingEmail,
          phone,
          country,
          city,
          timeZone,
          neighborhood,
          about,
          serviceName,
          servicePrice,
          serviceDurationMinutes,
          serviceCategory,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setStatus("error");
        setErrorText(data?.error || t.signupFailed);
        return;
      }

      setStatus("success");
      setCreatedSlug(data.slug);
    } catch {
      setStatus("error");
      setErrorText(t.signupRequestFailed);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {t.signupTitle}
          </h1>

          <p className="mt-4 text-lg leading-8 text-neutral-600">
            {t.signupSubtitle}
          </p>

          {status === "success" && createdSlug ? (
            <div className="mt-10 rounded-3xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-2xl font-semibold text-green-800">
                {t.signupSuccessTitle}
              </h2>

              <p className="mt-3 text-green-700">{t.signupSuccessText}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {t.logInToDashboard}
                </Link>

                <Link
                  href={`/${createdSlug}`}
                  className="rounded-full border border-green-300 px-6 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                >
                  {t.openPublicPage}
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-6 rounded-3xl border border-neutral-200 p-6"
            >
              <div className="rounded-2xl bg-neutral-50 p-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {t.accountSection}
                </h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.loginEmail}
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (!bookingEmail) {
                      setBookingEmail(e.target.value);
                    }
                  }}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder="master@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.passwordLabel}
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={t.passwordMinPlaceholder}
                />
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {t.publicPageSection}
                </h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.pageSlug}
                </label>

                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder="anna-beauty"
                />

                <p className="mt-2 text-sm text-neutral-500">
                  {t.publicLinkHint}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.displayName}
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder="Anna Petrova"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.bookingEmailLabel}
                </label>

                <input
                  type="email"
                  required
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={t.bookingEmailPlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.formPhone}
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={t.phonePlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {extraText.country}
                </label>

                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={extraText.countryPlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {timeZoneText[locale].timeZone}
                </label>

                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  {masterTimeZones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {getTimeZoneLabel(item.value)}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm text-neutral-500">
                  {extraText.timeZoneHelp}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {t.city}
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    placeholder={t.cityPlaceholder}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {t.neighborhood}
                  </label>

                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    placeholder={t.neighborhoodPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.about}
                </label>

                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={t.aboutPlaceholder}
                />
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {t.firstService}
                </h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.serviceName}
                </label>

                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder={t.serviceNamePlaceholder}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {t.price}
                  </label>

                  <input
                    type="text"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {t.durationMinutes}
                  </label>

                  <input
                    type="number"
                    required
                    min={15}
                    step={15}
                    value={serviceDurationMinutes}
                    onChange={(e) =>
                      setServiceDurationMinutes(Number(e.target.value))
                    }
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {t.category}
                  </label>

                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  >
                    {serviceCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {getServiceCategoryLabel(category.value, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {turnstileSiteKey ? (
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <p className="mb-3 text-sm font-medium text-neutral-800">
                    {t.securityCheck}
                  </p>

                  <TurnstileWidget
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  {t.missingTurnstileSiteKey}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? t.creating : t.createBookingPage}
              </button>

              {status === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorText}
                </div>
              )}
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}