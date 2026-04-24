"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Locale } from "../lib/site-config";

function stripLocale(path: string): string {
  const p = (path || "/").replace(/^\/(pt-BR|en)/, "");
  return p || "/";
}

function setCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function LocaleToggle() {
  const pathname = usePathname() ?? "/";
  const params = useParams<{ locale?: Locale }>();
  const current: Locale = params?.locale === "en" ? "en" : "pt-BR";
  const bare = stripLocale(pathname);
  const ptHref = `/pt-BR${bare === "/" ? "" : bare}`;
  const enHref = `/en${bare === "/" ? "" : bare}`;

  return (
    <span
      className="locale-toggle"
      aria-label={current === "en" ? "Switch language" : "Trocar idioma"}
    >
      <Link
        href={ptHref}
        onClick={() => setCookie("pt-BR")}
        className={`locale-toggle-btn${current === "pt-BR" ? " active" : ""}`}
      >
        PT
      </Link>
      <span className="locale-toggle-sep" aria-hidden="true">
        |
      </span>
      <Link
        href={enHref}
        onClick={() => setCookie("en")}
        className={`locale-toggle-btn${current === "en" ? " active" : ""}`}
      >
        EN
      </Link>
    </span>
  );
}
