import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt-BR", "en"] as const;
const DEFAULT_LOCALE = "pt-BR";

export function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

export function detectLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string | null
): string {
  if (cookieLocale === "pt-BR" || cookieLocale === "en") return cookieLocale;
  const accept = acceptLanguage ?? "";
  if (/\bpt\b|pt-BR|pt-PT/i.test(accept)) return "pt-BR";
  if (/\ben\b|en-US|en-GB/i.test(accept)) return "en";
  return DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(
    req.cookies.get("NEXT_LOCALE")?.value,
    req.headers.get("accept-language")
  );
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url.toString(), 307);
}

export const config = {
  matcher: [
    "/((?!_next|assets|posts/.+\\.[a-z0-9]+|favicon|apple-touch-icon|sitemap|robots|rss\\.xml|en/rss\\.xml).*)",
  ],
};
