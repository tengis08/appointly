"use client";

import { useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useLocale } from "@/components/locale-provider";
import { supabase } from "@/lib/supabase";

export default function TengisPage() {
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");

    const payload = {
      name,
      email,
      phone,
      message,
    };

    const { error } = await supabase.from("contact_requests").insert([payload]);

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }

    const response = await fetch("/api/contact-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setErrorText(data?.error || "Email notification failed.");
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
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
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder={t.formMessage}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : t.sendRequest}
            </button>

            {status === "success" && (
              <p className="text-sm font-medium text-green-600">
                Your request has been sent successfully.
              </p>
            )}

            {status === "error" && (
              <p className="text-sm font-medium text-red-600">
                Something went wrong: {errorText}
              </p>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}