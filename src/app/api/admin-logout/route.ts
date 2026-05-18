import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await clearAdminSessionCookie();

  return NextResponse.redirect(
    new URL("/appointments-login?loggedOut=1", request.url),
    { status: 303 }
  );
}