"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TurnstileWidget } from "@/components/turnstile-widget";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type AppointmentsLoginClientProps = {
  hasError: boolean;
  loggedOut: boolean;
};

export function AppointmentsLoginClient({
  hasError,
  loggedOut,
}: AppointmentsLoginClientProps) {
  const [turnstileToken, setTurnstileToken] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Admin login
          </h1>

          <p className="mt-4 text-neutral-600">
            Enter admin credentials to view internal appointments.
          </p>

          {hasError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Invalid admin login, password, or security check.
            </div>
          )}

          {loggedOut && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              You have been logged out.
            </div>
          )}

          <form
            action="/api/admin-login"
            method="POST"
            className="mt-8 space-y-5 rounded-3xl border border-neutral-200 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Username
              </label>

              <input
                name="username"
                required
                autoComplete="username"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Password
              </label>

              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            {turnstileSiteKey ? (
              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-800">
                  Security check
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
                Turnstile site key is missing. Admin security check is not visible.
              </div>
            )}

            <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              Log in as admin
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
