"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";

type BillingClientProps = {
  slug: string;
  masterName: string;
  currentPlan: string;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
  currentPeriodEnd: string | null;
  success: boolean;
  cancelled: boolean;
};

const billingText = {
  en: {
    dashboardLabel: "Master dashboard",
    billing: "Billing",
    subtitlePrefix: "Manage the monthly subscription plan for",
    backToDashboard: "Back to dashboard",
    checkoutCompleted:
      "Stripe checkout completed. Your subscription status is shown below.",
    checkoutCancelled: "Checkout was cancelled. No payment was completed.",
    currentSubscription: "Current subscription",
    currentSubscriptionText:
      "View your current plan and manage your billing settings.",
    manageSubscription: "Manage subscription",
    currentPlan: "Current plan",
    subscriptionStatus: "Subscription status",
    currentPeriodEnds: "Current period ends",
    free: "Free",
    basic: "Basic",
    premium: "Premium",
    active: "Active",
    trialing: "Trialing",
    pastDue: "Past due",
    cancelled: "Cancelled",
    canceled: "Canceled",
    inactive: "Inactive",
    perMonth: "/month",
    trialIncluded: "14-day free trial included",
    trialNote:
      "Cancel anytime during the 14-day trial before paid billing begins.",
    paidCancelNote:
      "After paid billing starts, you can cancel future renewals through Stripe billing portal.",
    basicDescription:
      "For independent service providers who need simple online booking.",
    premiumDescription:
      "For providers who want more visibility, automation, and business tools.",
    basicFeature1: "Public booking page",
    basicFeature2: "Master dashboard",
    basicFeature3: "Services editor",
    basicFeature4: "Availability and blocked dates",
    basicFeature5: "Email confirmations and reminders",
    basicFeature6: "Client cancellation link",
    basicFeature7: "Booking page QR code",
    premiumFeature1: "Everything in Basic",
    premiumFeature2: "Personal subdomain: your-name.appointly.vip",
    premiumFeature3: "Telegram notifications for the master",
    premiumFeature4: "Higher placement in the Masters directory",
    premiumFeature5: "Business analytics",
    premiumFeature6: "CSV export for accounting",
    premiumFeature7: "Live calendar subscription feed",
    premiumFeature8: "Optional unlisted profile in Masters directory",
    premiumFeature9: "Custom booking and cancellation policy text",
    chooseBasic: "Choose Basic",
    choosePremium: "Choose Premium",
  },

  es: {
    dashboardLabel: "Panel del maestro",
    billing: "Facturación",
    subtitlePrefix: "Administra el plan mensual para",
    backToDashboard: "Volver al panel",
    checkoutCompleted:
      "El pago en Stripe se completó. El estado de tu suscripción aparece abajo.",
    checkoutCancelled: "El pago fue cancelado. No se realizó ningún cobro.",
    currentSubscription: "Suscripción actual",
    currentSubscriptionText:
      "Consulta tu plan actual y administra la configuración de facturación.",
    manageSubscription: "Administrar suscripción",
    currentPlan: "Plan actual",
    subscriptionStatus: "Estado de suscripción",
    currentPeriodEnds: "El periodo actual termina",
    free: "Gratis",
    basic: "Basic",
    premium: "Premium",
    active: "Activa",
    trialing: "Prueba",
    pastDue: "Pago pendiente",
    cancelled: "Cancelada",
    canceled: "Cancelada",
    inactive: "Inactiva",
    perMonth: "/mes",
    trialIncluded: "Prueba gratis de 14 días incluida",
    trialNote:
      "Puedes cancelar durante la prueba de 14 días antes de que empiece el pago.",
    paidCancelNote:
      "Cuando empiece el pago, puedes cancelar futuras renovaciones desde el portal de Stripe.",
    basicDescription:
      "Para especialistas independientes que necesitan reservas online simples.",
    premiumDescription:
      "Para especialistas que quieren más visibilidad, automatización y herramientas de negocio.",
    basicFeature1: "Página pública de reservas",
    basicFeature2: "Panel del maestro",
    basicFeature3: "Editor de servicios",
    basicFeature4: "Disponibilidad y fechas bloqueadas",
    basicFeature5: "Confirmaciones y recordatorios por email",
    basicFeature6: "Enlace de cancelación para clientes",
    basicFeature7: "Código QR para la página de reservas",
    premiumFeature1: "Todo lo de Basic",
    premiumFeature2: "Subdominio personal: tu-nombre.appointly.vip",
    premiumFeature3: "Notificaciones de Telegram para el maestro",
    premiumFeature4: "Posición más alta en el directorio",
    premiumFeature5: "Analítica de negocio",
    premiumFeature6: "Exportación CSV para contabilidad",
    premiumFeature7: "Suscripción de calendario en vivo",
    premiumFeature8: "Perfil opcional oculto del directorio",
    premiumFeature9: "Texto personalizado de reserva y cancelación",
    chooseBasic: "Elegir Basic",
    choosePremium: "Elegir Premium",
  },

  ru: {
    dashboardLabel: "Кабинет мастера",
    billing: "Оплата",
    subtitlePrefix: "Управление месячной подпиской для",
    backToDashboard: "Назад в кабинет",
    checkoutCompleted:
      "Оплата через Stripe завершена. Статус подписки показан ниже.",
    checkoutCancelled: "Оплата была отменена. Списание не произошло.",
    currentSubscription: "Текущая подписка",
    currentSubscriptionText:
      "Посмотрите текущий тариф и управляйте настройками оплаты.",
    manageSubscription: "Управлять подпиской",
    currentPlan: "Текущий тариф",
    subscriptionStatus: "Статус подписки",
    currentPeriodEnds: "Текущий период заканчивается",
    free: "Бесплатный",
    basic: "Basic",
    premium: "Premium",
    active: "Активна",
    trialing: "Пробный период",
    pastDue: "Просрочена оплата",
    cancelled: "Отменена",
    canceled: "Отменена",
    inactive: "Неактивна",
    perMonth: "/месяц",
    trialIncluded: "Включён бесплатный пробный период 14 дней",
    trialNote:
      "Подписку можно отменить во время 14-дневного пробного периода до начала платного списания.",
    paidCancelNote:
      "После начала платного периода можно отменить будущие продления через Stripe billing portal.",
    basicDescription:
      "Для независимых специалистов, которым нужна простая онлайн-запись.",
    premiumDescription:
      "Для специалистов, которым нужны больше видимости, автоматизация и бизнес-инструменты.",
    basicFeature1: "Публичная страница записи",
    basicFeature2: "Кабинет мастера",
    basicFeature3: "Редактор услуг",
    basicFeature4: "График и заблокированные даты",
    basicFeature5: "Email-подтверждения и напоминания",
    basicFeature6: "Ссылка отмены записи для клиента",
    basicFeature7: "QR-код страницы записи",
    premiumFeature1: "Всё, что есть в Basic",
    premiumFeature2: "Персональный поддомен: your-name.appointly.vip",
    premiumFeature3: "Telegram-уведомления для мастера",
    premiumFeature4: "Более высокая позиция в каталоге мастеров",
    premiumFeature5: "Бизнес-аналитика",
    premiumFeature6: "CSV-экспорт для бухгалтерского учёта",
    premiumFeature7: "Живая подписка на календарь",
    premiumFeature8: "Можно скрыть профиль из общего каталога",
    premiumFeature9: "Свой текст правил записи и отмены",
    chooseBasic: "Выбрать Basic",
    choosePremium: "Выбрать Premium",
  },
} satisfies Record<Locale, Record<string, string>>;

function formatPlanName(
  plan: string | null | undefined,
  text: Record<string, string>
) {
  if (plan === "premium") return text.premium;
  if (plan === "basic") return text.basic;
  return text.free;
}

function formatStatus(
  status: string | null | undefined,
  text: Record<string, string>
) {
  if (status === "active") return text.active;
  if (status === "trialing") return text.trialing;
  if (status === "past_due") return text.pastDue;
  if (status === "cancelled") return text.cancelled;
  if (status === "canceled") return text.canceled;
  return text.inactive;
}

function isCurrentPlan(params: {
  currentPlan: string;
  subscriptionStatus: string;
  plan: "basic" | "premium";
}) {
  const allowedStatus =
    params.subscriptionStatus === "active" ||
    params.subscriptionStatus === "trialing";

  return params.currentPlan === params.plan && allowedStatus;
}

export function BillingClient({
  slug,
  masterName,
  currentPlan,
  subscriptionStatus,
  hasStripeCustomer,
  currentPeriodEnd,
  success,
  cancelled,
}: BillingClientProps) {
  const { locale } = useLocale();
  const text = billingText[locale];

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              {text.dashboardLabel}
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
              {text.billing}
            </h1>

            <p className="mt-4 text-neutral-600">
              {text.subtitlePrefix} {masterName}.
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}`}
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            {text.backToDashboard}
          </Link>
        </div>

        {success && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {text.checkoutCompleted}
          </div>
        )}

        {cancelled && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
            {text.checkoutCancelled}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                {text.currentSubscription}
              </h2>

              <p className="mt-2 text-sm text-neutral-600">
                {text.currentSubscriptionText}
              </p>
            </div>

            {hasStripeCustomer && (
              <form action="/api/create-customer-portal-session" method="POST">
                <button className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                  {text.manageSubscription}
                </button>
              </form>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-neutral-500">{text.currentPlan}</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {formatPlanName(currentPlan, text)}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-neutral-500">
                {text.subscriptionStatus}
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {formatStatus(subscriptionStatus, text)}
              </p>
            </div>
          </div>

          {currentPeriodEnd && (
            <p className="mt-4 text-sm text-neutral-600">
              {text.currentPeriodEnds}: {" "}
              {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-2xl font-semibold text-neutral-900">Basic</h2>

            <p className="mt-3 text-neutral-600">{text.basicDescription}</p>

            <div className="mt-6 text-4xl font-bold text-neutral-900">
              $9.99
              <span className="text-base font-medium text-neutral-500">
                {text.perMonth}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">{text.trialIncluded}</p>
              <p className="mt-1">{text.trialNote}</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-neutral-700">
              <li>{text.basicFeature1}</li>
              <li>{text.basicFeature2}</li>
              <li>{text.basicFeature3}</li>
              <li>{text.basicFeature4}</li>
              <li>{text.basicFeature5}</li>
              <li>{text.basicFeature6}</li>
              <li>{text.basicFeature7}</li>
            </ul>

            <p className="mt-6 text-sm text-neutral-500">
              {text.paidCancelNote}
            </p>

            {isCurrentPlan({
              currentPlan,
              subscriptionStatus,
              plan: "basic",
            }) ? (
              <div className="mt-8 rounded-full border border-green-300 bg-green-50 px-6 py-3 text-center text-sm font-semibold text-green-700">
                {text.currentPlan}
              </div>
            ) : (
              <form
                action="/api/create-checkout-session"
                method="POST"
                className="mt-8"
              >
                <input type="hidden" name="plan" value="basic" />

                <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                  {text.chooseBasic}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-900 p-6">
            <h2 className="text-2xl font-semibold text-neutral-900">Premium</h2>

            <p className="mt-3 text-neutral-600">{text.premiumDescription}</p>

            <div className="mt-6 text-4xl font-bold text-neutral-900">
              $14.99
              <span className="text-base font-medium text-neutral-500">
                {text.perMonth}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">{text.trialIncluded}</p>
              <p className="mt-1">{text.trialNote}</p>
            </div>

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
              {text.paidCancelNote}
            </p>

            {isCurrentPlan({
              currentPlan,
              subscriptionStatus,
              plan: "premium",
            }) ? (
              <div className="mt-8 rounded-full border border-green-300 bg-green-50 px-6 py-3 text-center text-sm font-semibold text-green-700">
                {text.currentPlan}
              </div>
            ) : (
              <form
                action="/api/create-checkout-session"
                method="POST"
                className="mt-8"
              >
                <input type="hidden" name="plan" value="premium" />

                <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                  {text.choosePremium}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
