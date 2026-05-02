import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    "password-reset"?: string;
  }>;
};

function getErrorText(error?: string) {
  if (error === "missing-fields") return "Please enter email and password.";
  if (error === "invalid-login") return "Invalid email or password.";
  if (error === "server-error") return "Unexpected server error. Please try again.";
  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const queryParams = await searchParams;

  const errorText = getErrorText(queryParams.error);
  const passwordResetSuccess = queryParams["password-reset"] === "1";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Log in
          </h1>

          <p className="mt-4 text-neutral-600">
            Access your master dashboard.
          </p>

          {passwordResetSuccess && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              Your password has been updated. You can now log in with your new
              password.
            </div>
          )}

          {errorText && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorText}
            </div>
          )}

          <form
            action="/api/login-master"
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

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-medium text-neutral-800">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-neutral-700 underline underline-offset-4 hover:text-black"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                name="password"
                required
                placeholder="Your password"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <button className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              Log in
            </button>

            <p className="text-sm text-neutral-600">
              No account yet?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Create master page
              </Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}