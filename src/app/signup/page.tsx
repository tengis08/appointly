"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [about, setAbout] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDurationMinutes, setServiceDurationMinutes] = useState(60);
  const [serviceCategory, setServiceCategory] = useState("manicure");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorText, setErrorText] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");
    setCreatedSlug("");

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
        city,
        neighborhood,
        about,
        serviceName,
        servicePrice,
        serviceDurationMinutes,
        serviceCategory,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setErrorText(data?.error || "Signup failed.");
      return;
    }

    setStatus("success");
    setCreatedSlug(data.slug);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Create your master page
          </h1>

          <p className="mt-4 text-lg leading-8 text-neutral-600">
            Create a booking page for your services.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-3xl border border-neutral-200 p-6"
          >
            <div className="rounded-2xl bg-neutral-50 p-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Account
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Login email
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
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="rounded-2xl bg-neutral-50 p-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Public page
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Page slug
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
                Your public link will be: appointly.vip/your-slug
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Display name
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
                Email for booking notifications
              </label>
              <input
                type="email"
                required
                value={bookingEmail}
                onChange={(e) => setBookingEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="where booking emails should arrive"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="+1..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder="Brooklyn"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Neighborhood
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                  placeholder="Brighton Beach"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                About
              </label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="Short description about your services"
              />
            </div>

            <div className="rounded-2xl bg-neutral-50 p-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                First service
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Service name
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                placeholder="Classic Manicure"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Price
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
                  Duration, minutes
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
                  Category
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                >
                  <option value="manicure">Manicure</option>
                  <option value="pedicure">Pedicure</option>
                  <option value="lashes">Lashes</option>
                  <option value="brows">Brows</option>
                  <option value="haircut">Haircut</option>
                  <option value="hair coloring">Hair coloring</option>
                  <option value="massage">Massage</option>
                  <option value="skincare">Skincare</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Creating..." : "Create booking page"}
            </button>

            {status === "success" && createdSlug && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <p className="font-semibold">Page created successfully.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/${createdSlug}`}
                    className="underline underline-offset-4"
                  >
                    Open public page
                  </Link>

                  <Link
                    href={`/dashboard/${createdSlug}`}
                    className="underline underline-offset-4"
                  >
                    Open dashboard
                  </Link>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorText}
              </div>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}