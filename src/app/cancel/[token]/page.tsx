import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type CancelPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ cancelled?: string }>;
};

export default async function CancelAppointmentPage({
  params,
  searchParams,
}: CancelPageProps) {
  const { token } = await params;
  const queryParams = await searchParams;

  const { data: appointment } = await supabaseAdmin
    .from("appointments")
    .select(
      "service_name, appointment_date, appointment_time, client_name, status"
    )
    .eq("cancel_token", token)
    .maybeSingle();

  const cancelledNow = queryParams.cancelled === "1";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Cancel appointment
          </h1>

          {!appointment && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <p className="text-red-700">
                This cancellation link is invalid or expired.
              </p>
            </div>
          )}

          {appointment && (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
              {cancelledNow || appointment.status === "cancelled" ? (
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    Appointment cancelled
                  </h2>
                  <p className="mt-3 text-neutral-600">
                    This booking request has been cancelled.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-neutral-600">
                    Please confirm that you want to cancel this booking request.
                  </p>

                  <div className="mt-6 space-y-2 text-sm text-neutral-700">
                    <p>
                      <strong>Client:</strong> {appointment.client_name}
                    </p>
                    <p>
                      <strong>Service:</strong> {appointment.service_name}
                    </p>
                    <p>
                      <strong>Date:</strong> {appointment.appointment_date}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.appointment_time}
                    </p>
                  </div>

                  <form
                    action="/api/cancel-appointment"
                    method="POST"
                    className="mt-6"
                  >
                    <input type="hidden" name="token" value={token} />

                    <button
                      type="submit"
                      className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Cancel appointment
                    </button>
                  </form>
                </div>
              )}

              <Link
                href="/"
                className="mt-6 inline-block text-sm underline underline-offset-4"
              >
                Back to Appointly
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}