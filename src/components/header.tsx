import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Appointly
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/masters" className="text-neutral-700 hover:text-black">
              Masters
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <select className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
            <option>English</option>
            <option>Español</option>
            <option>Русский</option>
          </select>

          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}