"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ContactButtons } from "@/components/contact-buttons";
import { MasterAvatar } from "@/components/master-avatar";
import { BookingForm } from "@/components/booking-form";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import type { Service } from "@/types/master";
import { getTimeZoneLabel, timeZoneText } from "@/lib/timezones";

type MasterPublicPageProps = {
  master: {
    slug: string;
    name: string;
    about?: string | null;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    country?: string | null;
    city?: string | null;
    timeZone?: string | null;
    neighborhood?: string | null;
    photoUrl?: string | null;
    pageTheme?: string | null;
    customBookingMessage?: string | null;
    bookingPolicyText?: string | null;

    instagramUrl?: string | null;
    telegramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
    vkUrl?: string | null;

    bookingWindowDays?: number;
    services: Service[];
  };
  isPremium: boolean;
};

type PublicTheme = "classic" | "blue" | "beige";

type ThemeClasses = {
  page: string;
  panel: string;
  border: string;
  heading: string;
  muted: string;
  button: string;
  outlineButton: string;
  chip: string;
  focus: string;
  infoBox: string;
};

const themes: Record<PublicTheme, ThemeClasses> = {
  classic: {
    page: "bg-white",
    panel: "bg-white",
    border: "border-neutral-200",
    heading: "text-neutral-900",
    muted: "text-neutral-600",
    button: "bg-neutral-900 text-white hover:bg-neutral-800",
    outlineButton: "border-neutral-300 text-neutral-900 hover:bg-neutral-100",
    chip: "border-neutral-300 text-neutral-900 hover:bg-neutral-100",
    focus: "focus:border-neutral-500",
    infoBox: "border-neutral-200 bg-neutral-50 text-neutral-700",
  },
  blue: {
    page: "bg-slate-50",
    panel: "bg-white",
    border: "border-blue-100",
    heading: "text-slate-950",
    muted: "text-slate-600",
    button: "bg-blue-700 text-white hover:bg-blue-800",
    outlineButton: "border-blue-200 text-blue-900 hover:bg-blue-50",
    chip: "border-blue-200 text-blue-900 hover:bg-blue-50",
    focus: "focus:border-blue-500",
    infoBox: "border-blue-100 bg-blue-50 text-blue-900",
  },
  beige: {
    page: "bg-stone-50",
    panel: "bg-white",
    border: "border-stone-200",
    heading: "text-stone-950",
    muted: "text-stone-700",
    button: "bg-stone-900 text-white hover:bg-stone-800",
    outlineButton: "border-stone-300 text-stone-900 hover:bg-stone-100",
    chip: "border-stone-300 text-stone-900 hover:bg-stone-100",
    focus: "focus:border-stone-500",
    infoBox: "border-stone-200 bg-stone-100 text-stone-800",
  },
};

function normalizeTheme(value: string | null | undefined): PublicTheme {
  if (value === "blue" || value === "beige") return value;
  return "classic";
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.2L16.8 8.5L14.2 16L11.4 13.5L10 15.8L10.2 12.5L8 12.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M13.2 19V12.8H15.3L15.7 10.5H13.2V9.1C13.2 8.4 13.5 8 14.4 8H15.8V6H13.8C11.8 6 10.9 7.2 10.9 9.2V10.5H9.3V12.8H10.9V19H13.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M13.5 8.2C14 9.2 14.8 9.9 16 10.2V12.2C15 12.1 14.1 11.7 13.5 11.1V14.8C13.5 16.5 12.2 17.8 10.5 17.8C8.8 17.8 7.5 16.5 7.5 14.8C7.5 13.2 8.7 11.9 10.3 11.8V13.8C9.8 13.9 9.5 14.3 9.5 14.8C9.5 15.3 9.9 15.8 10.5 15.8C11.1 15.8 11.5 15.3 11.5 14.8V6.8H13.5V8.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 9.2C8.2 12.2 9.6 14 10.4 14H11V9.2H12.8V11.9C13.6 11.8 14.5 10.1 14.8 9.2H16.6C16 10.4 15 11.7 14.3 12.3C15 12.8 16.1 14.1 16.5 15.2H14.5C14.1 14.3 13.4 13.2 12.8 13.1V15.2H12.6C9.7 15.2 8.1 13.2 8 9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

type SocialLinkProps = {
  href: string;
  label: string;
  theme: ThemeClasses;
  children: React.ReactNode;
};

const masterPageText = {
  en: {
    country: "Country",
    timeZone: timeZoneText.en.timeZoneShort,
    policyTitle: "Booking policy",
  },
  es: {
    country: "País",
    timeZone: timeZoneText.es.timeZoneShort,
    policyTitle: "Política de reservas",
  },
  ru: {
    country: "Страна",
    timeZone: timeZoneText.ru.timeZoneShort,
    policyTitle: "Правила записи",
  },
} satisfies Record<Locale, Record<string, string>>;

function buildGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function SocialLink({ href, label, theme, children }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${theme.chip}`}
    >
      {children}
    </a>
  );
}

export function MasterPublicPage({ master, isPremium }: MasterPublicPageProps) {
  const { locale, t } = useLocale();
  const text = masterPageText[locale];

  const theme = themes.classic;
  const customBookingMessage = isPremium ? master.customBookingMessage || "" : "";
  const bookingPolicyText = isPremium ? master.bookingPolicyText || "" : "";

  const hasSocialLinks =
    master.instagramUrl ||
    master.telegramUrl ||
    master.facebookUrl ||
    master.tiktokUrl ||
    master.vkUrl;

  return (
    <div className={`flex min-h-screen flex-col ${theme.page}`}>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className={`flex flex-col gap-6 rounded-3xl border p-6 sm:flex-row sm:items-start ${theme.panel} ${theme.border}`}>
                <MasterAvatar photoUrl={master.photoUrl} name={master.name} />

                <div className="flex-1">
                  <div>
                    <h1 className={`text-3xl font-bold tracking-tight ${theme.heading}`}>
                      {master.name}
                    </h1>

                    {hasSocialLinks && (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {master.instagramUrl && (
                          <SocialLink href={master.instagramUrl} label={`${master.name} Instagram`} theme={theme}>
                            <InstagramIcon />
                          </SocialLink>
                        )}

                        {master.telegramUrl && (
                          <SocialLink href={master.telegramUrl} label={`${master.name} Telegram`} theme={theme}>
                            <TelegramIcon />
                          </SocialLink>
                        )}

                        {master.facebookUrl && (
                          <SocialLink href={master.facebookUrl} label={`${master.name} Facebook`} theme={theme}>
                            <FacebookIcon />
                          </SocialLink>
                        )}

                        {master.tiktokUrl && (
                          <SocialLink href={master.tiktokUrl} label={`${master.name} TikTok`} theme={theme}>
                            <TiktokIcon />
                          </SocialLink>
                        )}

                        {master.vkUrl && (
                          <SocialLink href={master.vkUrl} label={`${master.name} VK`} theme={theme}>
                            <VkIcon />
                          </SocialLink>
                        )}
                      </div>
                    )}
                  </div>

                  {master.about && (
                    <p className={`mt-4 max-w-2xl text-base leading-7 ${theme.muted}`}>
                      {master.about}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 text-sm text-neutral-700">
                    {master.address && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>{t.address}:</span>{" "}
                        <a
                          href={buildGoogleMapsUrl(master.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 hover:text-neutral-950"
                        >
                          {master.address}
                        </a>
                      </p>
                    )}

                    {master.phone && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>{t.phone}:</span>{" "}
                        {master.phone}
                      </p>
                    )}

                    {master.country && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>
                          {text.country}:
                        </span>{" "}
                        {master.country}
                      </p>
                    )}

                    {master.city && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>{t.city}:</span>{" "}
                        {master.city}
                      </p>
                    )}

                    {master.timeZone && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>
                          {text.timeZone}:
                        </span>{" "}
                        {getTimeZoneLabel(master.timeZone)}
                      </p>
                    )}

                    {master.neighborhood && (
                      <p>
                        <span className={`font-medium ${theme.heading}`}>
                          {t.neighborhood}:
                        </span>{" "}
                        {master.neighborhood}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <ContactButtons
                      phone={master.phone || undefined}
                      whatsapp={master.whatsapp || undefined}
                    />
                  </div>
                </div>
              </div>


              <div className={`mt-8 rounded-3xl border p-6 ${theme.panel} ${theme.border}`}>
                <h2 className={`text-2xl font-semibold tracking-tight ${theme.heading}`}>
                  {t.services}
                </h2>

                <div className="mt-6 space-y-4">
                  {master.services.map((service) => (
                    <div
                      key={service.id}
                      className={`flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}
                    >
                      <div>
                        <h3 className={`text-base font-semibold ${theme.heading}`}>
                          {service.name}
                        </h3>

                        <p className={`mt-1 text-sm ${theme.muted}`}>
                          {t.duration}: {service.duration}
                        </p>
                      </div>

                      <div className={`text-base font-semibold ${theme.heading}`}>
                        {service.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <BookingForm
                masterSlug={master.slug}
                services={master.services}
                bookingWindowDays={master.bookingWindowDays || 30}
                masterTimeZone={master.timeZone || "America/New_York"}
                customBookingMessage={customBookingMessage}
                bookingPolicyText={bookingPolicyText}
                themeClasses={theme}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
