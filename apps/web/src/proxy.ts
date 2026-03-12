import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/race-planner", "/compare"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Strip locale prefix before checking protected paths (/en/dashboard → /dashboard)
  const strippedPath = pathname.replace(/^\/[a-z]{2}/, "");
  const isProtected = PROTECTED_PREFIXES.some((p) => strippedPath.startsWith(p));

  // Only run Supabase auth check when env vars are configured and route is protected
  if (isProtected && SUPABASE_URL && SUPABASE_ANON_KEY) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const localePrefix = pathname.match(/^\/[a-z]{2}/)?.[0] ?? "";
      const loginUrl = new URL(`${localePrefix}/login`, request.url);
      // `pathname` is server-derived — not user input — so no open-redirect risk.
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run next-intl i18n routing for all other requests
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except API routes, static files, and Next.js internals
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
