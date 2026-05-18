"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import { TurnstileWidget } from "@/components/turnstile-widget";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const loginExtraText = {
  en: {
    tooManyAttempts:
      "Too many login attempts. Please wait and try again later.",
    securityCheckFailed:
      "Security check failed. Please refresh the page and try again.",
    missingTurnstileSiteKey:
      "Turnstile site key is missing. Login security check is not visible.",
  },
  es: {
    tooManyAttempts:
      "Demasiados intentos de inicio de sesión. Espera e inténtalo más tarde.",
    securityCheckFailed:
      "La verificación de seguridad falló. Actualiza la página e inténtalo de nuevo.",
    missingTurnstileSiteKey:
      "Falta la clave de Turnstile. La verificación de seguridad no se muestra.",
  },
  ru: {
    tooManyAttempts:
      "Слишком много попыток входа. Подождите и попробуйте позже.",
    securityCheckFailed:
      "Проверка безопасности не прошла. Обновите страницу и попробуйте снова.",
    missingTurnstileSiteKey:
      "Не найден ключ Turnstile. Проверка безопасности при входе не отображается.",
  },
} satisfies Record<Locale, Record<string, string>>;

function LoginContent() {
  const { locale, t } = useLocale();
  const searchParams = useSearchParams();
  const [turnstileToken, setTurnstileToken] = useState("");

  const error = searchParams.get("error") || "";
  const passwordResetSuccess = searchParams.get("password-reset") === "1";

  function getErrorText() {
    if (error === "missing-fields") return t.loginErrorMissingFields;
    if (error === "invalid-login") return t.loginErrorInvalid;
    if (error === "server-error") return t.loginErrorServer;
    if (error === "security-check-failed") {
      return loginExtraText[locale].securityCheckFailed;
    }
    if (error === "too-many-attempts") {
      return loginExtraText[locale].tooManyAttempts;
    }

    return "";
  }

  const errorText = getErrorText();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {t.loginTitle}
          </h1>

          <p className="mt-4 text-neutral-600">{t.loginSubtitle}</p>

          {passwordResetSuccess && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {t.passwordResetSuccess}
            </div>
          )}

          {errorText && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorText}
            </div>
          )}

          <form
            action="/api/login-master"
            method="POST"
            className="mt-8 space-y-5 rounded-3xl border border-neutral-200 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {t.emailLabel}
              </label>

              <input
                type="email"
                name="email"
                required
                placeholder="master@email.com"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-medium text-neutral-800">
                  {t.passwordLabel}
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-neutral-700 underline underline-offset-4 hover:text-black"
                >
                  {t.forgotPassword}
                </Link>
              </div>

              <input
                type="password"
                name="password"
                required
                placeholder={t.passwordPlaceholder}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
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

                <input
                  type="hidden"
                  name="turnstileToken"
                  value={turnstileToken}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                {loginExtraText[locale].missingTurnstileSiteKey}
              </div>
            )}

            <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              {t.login}
            </button>

            <p className="text-sm text-neutral-600">
              {t.noAccountYet}{" "}
              <Link href="/signup" className="underline underline-offset-4">
                {t.createMasterPage}
              </Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}