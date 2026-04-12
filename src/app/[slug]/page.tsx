import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ContactButtons } from "@/components/contact-buttons";
import { MasterAvatar } from "@/components/master-avatar";
import { masters } from "@/data/masters";
import { notFound } from "next/navigation";

type MasterPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MasterPage({ params }: MasterPageProps) {
  const { slug } = await params;
  const master = masters[slug];

  if (!master) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 p-6 sm:flex-row sm:items-start">
                <MasterAvatar photoUrl={master.photoUrl} name={master.name} />

                <div className="flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                    {master.name}
                  </h1>

                  {master.about && (
                    <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
                      {master.about}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 text-sm text-neutral-700">
                    {master.address && (
                      <p>
                        <span className="font-medium text-neutral-900">Address:</span>{" "}
                        {master.address}
                      </p>
                    )}

                    {master.phone && (
                      <p>
                        <span className="font-medium text-neutral-900">Phone:</span>{" "}
                        {master.phone}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <ContactButtons
                      phone={master.phone}
                      whatsapp={master.whatsapp}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Services
                </h2>

                <div className="mt-6 space-y-4">
                  {master.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-neutral-900">
                          {service.name}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600">
                          Duration: {service.duration}
                        </p>
                      </div>

                      <div className="text-base font-semibold text-neutral-900">
                        {service.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-neutral-200 p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Book an appointment
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  This is a temporary booking form preview. Next step we will add
                  real calendar logic, available slots, and saving bookings.
                </p>

                <form className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Service
                    </label>
                    <select className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500">
                      {master.services.map((service) => (
                        <option key={service.id} value={service.name}>
                          {service.name} — {service.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Preferred time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Your name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                      placeholder="+1 (___) ___-____"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Confirm email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                      placeholder="Repeat your email"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Request booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}