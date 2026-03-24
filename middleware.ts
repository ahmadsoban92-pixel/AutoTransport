import { NextResponse, type NextRequest } from "next/server";

// Protect all CRM routes — /crm/*
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isCrmRoute =
    pathname.startsWith("/crm") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads");

  if (!isCrmRoute) {
    return NextResponse.next();
  }

  // Allow login page through
  if (pathname === "/crm/login") {
    return NextResponse.next();
  }

  // Check for the crm-auth cookie set by the login page on successful Supabase auth.
  const authCookie = request.cookies.get("crm-auth")?.value;

  if (!authCookie) {
    const loginUrl = new URL("/crm/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/dashboard/:path*", "/leads/:path*"],
};
