"use client";

import { useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useLocale } from "@/components/locale-provider";
import { TurnstileWidget } from "@/components/turnstile-widget";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function TengisPage() {
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("loading");
    setErrorText("");

    if (!turnstileToken) {
      setStatus("error");
      setErrorText(t.completeSecurityCheck);
      return;
    }

    const response = await fetch("/api/contact-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        message,
        turnstileToken,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      setStatus("error");
      setErrorText(data?.error || "Contact request failed.");
      setTurnstileToken("");
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setTurnstileToken("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            {t.tengisTitle}
          </h1>

          <p className="mt-4 text-lg text-neutral-600">{t.tengisText}</p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-3xl border border-neutral-200 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {t.formName}
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder={t.formName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {t.formEmail}
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={160}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="your@email.com"
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
                maxLength={40}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="+1 (___) ___-____"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {t.formMessage}
              </label>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder={t.formMessage}
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
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                {t.missingTurnstileSiteKey}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? t.sending : t.sendRequest}
            </button>

            {status === "success" && (
              <p className="text-sm font-medium text-green-600">
                {t.requestSent}
              </p>
            )}

            {status === "error" && (
              <p className="text-sm font-medium text-red-600">
                {t.somethingWentWrong} {errorText}
              </p>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}