"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

const homeText = {
  en: {
    trialBadge: "14-day free trial",
    trialText:
      "Start with a 14-day free trial. Cancel anytime during the trial before paid billing begins.",
    pricingTitle: "Simple pricing for service providers",
    pricingSubtitle:
      "Start with Basic, or choose Premium for more visibility and automation tools.",
    basicTitle: "Basic",
    premiumTitle: "Premium",
    perMonth: "/month",
    trialIncluded: "14-day free trial included",
    cancelAnytime: "Cancel anytime through Stripe billing portal.",
    basicFeature1: "Public booking page",
    basicFeature2: "Email confirmations and reminders",
    basicFeature3: "Services, availability, blocked dates",
    basicFeature4: "Client cancellation link",
    basicFeature5: "Booking page QR code",
    premiumFeature1: "Everything in Basic",
    premiumFeature2: "Personal subdomain: your-name.appointly.vip",
    premiumFeature3: "Telegram notifications for the provider",
    premiumFeature4: "Higher placement in the Masters directory",
    premiumFeature5: "Business analytics",
    premiumFeature6: "CSV export for accounting",
    premiumFeature7: "Live calendar subscription feed",
    premiumFeature8: "Optional unlisted profile in Masters directory",
    premiumFeature9: "Custom booking and cancellation policy text",
    startTrial: "Start free trial",
  },
  es: {
    trialBadge: "Prueba gratis de 14 días",
    trialText:
      "Empieza con una prueba gratis de 14 días. Puedes cancelar durante la prueba antes de que empiece el pago.",
    pricingTitle: "Precios simples para especialistas",
    pricingSubtitle:
      "Empieza con Basic o elige Premium para más visibilidad y herramientas de automatización.",
    basicTitle: "Basic",
    premiumTitle: "Premium",
    perMonth: "/mes",
    trialIncluded: "Prueba gratis de 14 días incluida",
    cancelAnytime: "Cancela cuando quieras desde el portal de Stripe.",
    basicFeature1: "Página pública de reservas",
    basicFeature2: "Confirmaciones y recordatorios por email",
    basicFeature3: "Servicios, disponibilidad y fechas bloqueadas",
    basicFeature4: "Enlace de cancelación para clientes",
    basicFeature5: "Código QR para la página de reservas",
    premiumFeature1: "Todo lo de Basic",
    premiumFeature2: "Subdominio personal: tu-nombre.appointly.vip",
    premiumFeature3: "Notificaciones de Telegram para el especialista",
    premiumFeature4: "Mejor posición en el directorio",
    premiumFeature5: "Analítica de negocio",
    premiumFeature6: "Exportación CSV para contabilidad",
    premiumFeature7: "Suscripción de calendario en vivo",
    premiumFeature8: "Perfil opcional oculto del directorio",
    premiumFeature9: "Texto personalizado de reserva y cancelación",
    startTrial: "Empezar prueba gratis",
  },
  ru: {
    trialBadge: "14 дней бесплатно",
    trialText:
      "Начните с бесплатного пробного периода на 14 дней. Подписку можно отменить во время пробного периода до начала платного списания.",
    pricingTitle: "Простые тарифы для специалистов",
    pricingSubtitle:
      "Начните с Basic или выберите Premium для большей видимости и дополнительных бизнес-инструментов.",
    basicTitle: "Basic",
    premiumTitle: "Premium",
    perMonth: "/месяц",
    trialIncluded: "Включён бесплатный пробный период 14 дней",
    cancelAnytime: "Подписку можно отменить в любое время через Stripe billing portal.",
    basicFeature1: "Публичная страница записи",
    basicFeature2: "Email-подтверждения и напоминания",
    basicFeature3: "Услуги, график и заблокированные даты",
    basicFeature4: "Ссылка отмены записи для клиента",
    basicFeature5: "QR-код страницы записи",
    premiumFeature1: "Всё, что есть в Basic",
    premiumFeature2: "Персональный поддомен: your-name.appointly.vip",
    premiumFeature3: "Telegram-уведомления для специалиста",
    premiumFeature4: "Более высокая позиция в каталоге мастеров",
    premiumFeature5: "Бизнес-аналитика",
    premiumFeature6: "CSV-экспорт для бухгалтерского учёта",
    premiumFeature7: "Живая подписка на календарь",
    premiumFeature8: "Можно скрыть профиль из общего каталога",
    premiumFeature9: "Свой текст правил записи и отмены",
    startTrial: "Начать бесплатно",
  },
} satisfies Record<Locale, Record<string, string>>;

export default function HomePage() {
  const { locale, t } = useLocale();
  const text = homeText[locale];

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        <section className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm">
              {t.heroBadge}
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
              {t.heroTitle}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              {t.heroText}
            </p>

            <div className="mt-6 max-w-2xl rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-neutral-900">
                {text.trialBadge}
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {text.trialText}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {t.createPage}
              </Link>

              <Link
                href="/test-master"
                className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                {t.viewDemo}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">{t.feature1Title}</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              {t.feature1Text}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">{t.feature2Title}</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              {t.feature2Text}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">{t.feature3Title}</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              {t.feature3Text}
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900">
                {text.pricingTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-neutral-600">
                {text.pricingSubtitle}
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  {text.basicTitle}
                </h3>

                <div className="mt-5 text-4xl font-bold text-neutral-900">
                  $9.99
                  <span className="text-base font-medium text-neutral-500">
                    {text.perMonth}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-green-700">
                  {text.trialIncluded}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                  <li>{text.basicFeature1}</li>
                  <li>{text.basicFeature2}</li>
                  <li>{text.basicFeature3}</li>
                  <li>{text.basicFeature4}</li>
                  <li>{text.basicFeature5}</li>
                </ul>

                <p className="mt-6 text-sm text-neutral-500">
                  {text.cancelAnytime}
                </p>

                <Link
                  href="/signup"
                  className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.startTrial}
                </Link>
              </div>

              <div className="rounded-3xl border border-neutral-900 bg-white p-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  {text.premiumTitle}
                </h3>

                <div className="mt-5 text-4xl font-bold text-neutral-900">
                  $14.99
                  <span className="text-base font-medium text-neutral-500">
                    {text.perMonth}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-green-700">
                  {text.trialIncluded}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                  <li>{text.premiumFeature1}</li>
                  <li>{text.premiumFeature2}</li>
                  <li>{text.premiumFeature3}</li>
                  <li>{text.premiumFeature4}</li>
                  <li>{text.premiumFeature5}</li>
                  <li>{text.premiumFeature6}</li>
                  <li>{text.premiumFeature7}</li>
                  <li>{text.premiumFeature8}</li>
                  <li>{text.premiumFeature9}</li>
                </ul>

                <p className="mt-6 text-sm text-neutral-500">
                  {text.cancelAnytime}
                </p>

                <Link
                  href="/signup"
                  className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.startTrial}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
