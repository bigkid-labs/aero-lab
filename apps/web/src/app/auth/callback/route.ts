import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Prevent open redirect: only allow relative paths that do not contain a
  // protocol or double-slash, so an attacker cannot supply
  // `?next=https://attacker.com` and hijack the post-login redirect.
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.includes("//") && !rawNext.includes("://")
      ? rawNext
      : "/dashboard";

  // Guard: `code` is required for the OAuth exchange. Without it there is
  // nothing to process, so redirect to login immediately.
  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
