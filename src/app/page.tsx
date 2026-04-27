import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        <section className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm">
              Booking system for beauty masters
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
              Let clients book online without endless Instagram messages
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              Appointly helps independent beauty masters manage bookings,
              working hours, reminders, and client appointments in one simple
              place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Create your page
              </Link>

              <Link
                href="/test-master"
                className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                View demo
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Accept bookings 24/7</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              Clients choose a free slot on your page and book without calls or
              direct messages.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Stay in control</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              Set working hours, block days off, manage services, and keep your
              calendar organized.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Send reminders</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-700">
              Email reminders come by default. Premium masters can also enable
              SMS reminders for US phone numbers.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}