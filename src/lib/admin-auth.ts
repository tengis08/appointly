import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "appointly_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET environment variable.");
  }

  return secret;
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("hex");
}

function timingSafeEqualString(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function createAdminSessionToken(username: string) {
  const createdAt = Date.now();
  const payload = `${username}:${createdAt}`;
  const signature = signPayload(payload);

  return `${payload}:${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const parts = token.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [username, createdAtRaw, signature] = parts;

  if (!username || !createdAtRaw || !signature) {
    return false;
  }

  const createdAt = Number(createdAtRaw);

  if (!Number.isFinite(createdAt)) {
    return false;
  }

  const ageMs = Date.now() - createdAt;
  const maxAgeMs = SESSION_MAX_AGE_SECONDS * 1000;

  if (ageMs < 0 || ageMs > maxAgeMs) {
    return false;
  }

  const expectedUsername = process.env.ADMIN_USERNAME;

  if (!expectedUsername || username !== expectedUsername) {
    return false;
  }

  const payload = `${username}:${createdAtRaw}`;
  const expectedSignature = signPayload(payload);

  return timingSafeEqualString(signature, expectedSignature);
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
}

export async function requireAdminAccess() {
  const allowed = await isAdminLoggedIn();

  if (!allowed) {
    redirect("/appointments-login");
  }
}