import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMasterFromDb } from "@/lib/masters-db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DbMasterTestPage({ params }: PageProps) {
  const { slug } = await params;
  const master = await getMasterFromDb(slug);

  if (!master) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-sm font-medium text-green-700">
            This page reads master data from Supabase
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
            {master.name}
          </h1>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Profile
              </h2>

              <div className="mt-4 space-y-2 text-sm text-neutral-700">
                <p>
                  <strong>Slug:</strong> {master.slug}
                </p>
                <p>
                  <strong>Email:</strong> {master.bookingEmail || "-"}
                </p>
                <p>
                  <strong>Phone:</strong> {master.phone || "-"}
                </p>
                <p>
                  <strong>City:</strong> {master.city || "-"}
                </p>
                <p>
                  <strong>Neighborhood:</strong>{" "}
                  {master.neighborhood || "-"}
                </p>
                <p>
                  <strong>Slot step:</strong> {master.slotStepMinutes} min
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Working days
              </h2>

              <div className="mt-4 space-y-2 text-sm text-neutral-700">
                {master.workingDays.map((day) => (
                  <p key={day.dayOfWeek}>
                    Day {day.dayOfWeek}: {day.start} — {day.end}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              Services
            </h2>

            <div className="mt-4 space-y-3">
              {master.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-neutral-200 p-4 text-sm"
                >
                  <p className="font-semibold text-neutral-900">
                    {service.name}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    {service.price} · {service.duration} · {service.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}