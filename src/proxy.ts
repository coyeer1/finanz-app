import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/register", "/pricing", "/features"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith("/api/auth")
  );

  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect away from onboarding if user already has an org
  if (isLoggedIn && pathname === "/onboarding" && session?.user?.organizationId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to onboarding if logged in but no organization
  const protectedOrgPaths = ["/dashboard", "/transactions", "/budgets", "/categories", "/accounts", "/reports", "/settings"];
  if (
    isLoggedIn &&
    !session?.user?.organizationId &&
    protectedOrgPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|icons|manifest.json|sw.js|og-image.png|favicon.ico|.*\\..*).*)"],
};
