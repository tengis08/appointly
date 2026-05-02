import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

function getErrorText(error?: string) {
  if (error === "missing-token") return "Reset token is missing.";
  if (error === "short-password") return "Password must be at least 6 characters.";
  if (error === "passwords-do-not-match") return "Passwords do not match.";
  if (error === "invalid-token") return "This reset link is invalid.";
  if (error === "expired-token") return "This reset link has expired.";
  if (error === "update-failed") return "Password update failed.";
  if (error === "server-error") return "Unexpected server error.";
  return "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const queryParams = await searchParams;
  const token = queryParams.token || "";
  const errorText = getErrorText(queryParams.error);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Create new password
          </h1>

          <p className="mt-4 text-neutral-600">
            Enter a new password for your Appointly account.
          </p>

          {errorText && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorText}
            </div>
          )}

          {!token ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
              <p className="text-neutral-700">
                This reset link is missing a token.
              </p>

              <Link
                href="/forgot-password"
                className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Request new reset link
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
                  New password
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="New password"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Confirm new password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
                />
              </div>

              <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                Save new password
              </button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}