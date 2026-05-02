import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    sent?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const queryParams = await searchParams;
  const sent = queryParams.sent === "1";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Reset password
          </h1>

          <p className="mt-4 text-neutral-600">
            Enter your Appointly login email. If an account exists, we will send
            a password reset link.
          </p>

          {sent && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              If this email exists in Appointly, a password reset link has been
              sent.
            </div>
          )}

          <form
            action="/api/request-password-reset"
            method="POST"
            className="mt-8 space-y-5 rounded-3xl border border-neutral-200 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                Email
              </label>

              <input
                type="email"
                name="email"
                required
                placeholder="master@email.com"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              Send reset link
            </button>

            <p className="text-sm text-neutral-600">
              Remembered your password?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}