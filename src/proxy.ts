import { NextRequest, NextResponse } from "next/server";
import { getSubdomainFromHost } from "@/lib/subdomains";

function shouldSkipSubdomainRewrite(pathname: string) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;

  // Static files like /file.svg, /robots.txt, /sitemap.xml, images, etc.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipSubdomainRewrite(pathname)) {
    return NextResponse.next();
  }

  const subdomainSlug = getSubdomainFromHost(request.headers.get("host"));

  if (!subdomainSlug) {
    return NextResponse.next();
  }

  // Personal subdomain points to the master's public booking page.
  // Example: test-master.appointly.vip -> /test-master
  // We only rewrite the root path to avoid breaking /api, /dashboard, /login, etc.
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomainSlug}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};