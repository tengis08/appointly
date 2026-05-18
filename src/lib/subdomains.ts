const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dashboard",
  "login",
  "signup",
  "masters",
  "appointments",
  "billing",
  "stripe",
  "telegram",
  "support",
  "help",
  "mail",
  "email",
  "smtp",
  "imap",
  "pop",
  "cdn",
  "static",
  "assets",
  "test",
  "dev",
  "staging",
]);

const DEFAULT_SITE_URL = "https://appointly.vip";

function normalizeHost(host: string | null | undefined) {
  if (!host) return "";

  return host.toLowerCase().split(":")[0]?.trim() || "";
}

function normalizeSiteUrl(siteUrl?: string | null) {
  const rawSiteUrl = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim();

  try {
    const url = new URL(rawSiteUrl);
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function getSiteUrlParts(siteUrl?: string | null) {
  const url = new URL(normalizeSiteUrl(siteUrl));
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const port = url.port ? `:${url.port}` : "";

  return {
    protocol: url.protocol,
    hostname,
    port,
    origin: `${url.protocol}//${url.host}`.replace(/\/$/, ""),
  };
}

function getRootDomainFromSiteUrl(siteUrl?: string | null) {
  return getSiteUrlParts(siteUrl).hostname;
}

export function isReservedSubdomain(subdomain: string | null | undefined) {
  if (!subdomain) return true;

  return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
}

export function getSubdomainFromHost(host: string | null | undefined) {
  const hostname = normalizeHost(host);

  if (!hostname) return null;

  const rootDomain = getRootDomainFromSiteUrl();

  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return null;
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.slice(0, -(rootDomain.length + 1));

    if (!subdomain || subdomain.includes(".")) return null;
    if (isReservedSubdomain(subdomain)) return null;

    return subdomain;
  }

  // Local testing can use URLs like http://test-master.localhost:3000
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.slice(0, -".localhost".length);

    if (!subdomain || subdomain.includes(".")) return null;
    if (isReservedSubdomain(subdomain)) return null;

    return subdomain;
  }

  return null;
}

export function getPublicPathUrl(slug: string, siteUrl?: string | null) {
  const { origin } = getSiteUrlParts(siteUrl);
  return `${origin}/${slug}`;
}

export function getPublicSubdomainUrl(slug: string, siteUrl?: string | null) {
  const { protocol, hostname, port } = getSiteUrlParts(siteUrl);

  // Browsers resolve *.localhost to the local machine, so this works for dev:
  // http://test-master.localhost:3000
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${slug}.localhost${port}`;
  }

  return `${protocol}//${slug}.${hostname}${port}`;
}

export function getPublicBookingUrl(
  slug: string,
  isPremium: boolean,
  siteUrl?: string | null
) {
  return isPremium
    ? getPublicSubdomainUrl(slug, siteUrl)
    : getPublicPathUrl(slug, siteUrl);
}
