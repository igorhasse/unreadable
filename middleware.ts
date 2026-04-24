import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt-BR", "en"] as const;
const DEFAULT_LOCALE = "pt-BR";

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function detectLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie === "pt-BR" || cookie === "en") return cookie;

  const accept = req.headers.get("accept-language") ?? "";
  // Simple heuristic: prefer pt if it appears, else en if it appears, else default.
  if (/\bpt\b|pt-BR|pt-PT/i.test(accept)) return "pt-BR";
  if (/\ben\b|en-US|en-GB/i.test(accept)) return "en";
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url.toString(), 307);
}

export const config = {
  matcher: [
    // Skip: _next internals, public files with extensions, rss.xml, sitemap, robots, favicons, apple-touch-icon
    "/((?!_next|assets|posts/.+\\.[a-z0-9]+|favicon|apple-touch-icon|sitemap|robots|rss\\.xml|en/rss\\.xml).*)",
  ],
};
