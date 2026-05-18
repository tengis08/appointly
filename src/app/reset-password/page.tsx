"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocale } from "@/components/locale-provider";

function ResetPasswordContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const error = searchParams.get("error") || "";

  function getErrorText() {
    if (error === "missing-token") return t.resetErrorMissingToken;
    if (error === "short-password") return t.resetErrorShortPassword;
    if (error === "passwords-do-not-match") return t.resetErrorPasswordsDoNotMatch;
    if (error === "invalid-token") return t.resetErrorInvalidToken;
    if (error === "expired-token") return t.resetErrorExpiredToken;
    if (error === "update-failed") return t.resetErrorUpdateFailed;
    if (error === "server-error") return t.resetErrorServer;
    return "";
  }

  const errorText = getErrorText();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {t.resetPasswordTitle}
          </h1>

          <p className="mt-4 text-neutral-600">
            {t.resetPasswordSubtitle}
          </p>

          {errorText && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorText}
            </div>
          )}

          {!token ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
              <p className="text-neutral-700">
                {t.resetTokenMissingText}
              </p>

              <Link
                href="/forgot-password"
                className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
              >
                {t.requestNewResetLink}
              </Link>
            </div>
          ) : (
            <form
              action="/api/reset-password"
              method="POST"
              className="mt-8 space-y-5 rounded-3xl border border-neutral-200 p-6"
            >
              <input type="hidden" name="token" value={token} />

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.newPassword}
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder={t.newPassword}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {t.confirmNewPassword}
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder={t.repeatNewPassword}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                {t.saveNewPassword}
              </button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}