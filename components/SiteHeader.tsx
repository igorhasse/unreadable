import Link from "next/link";
import type { Locale } from "../lib/site-config";
import { t } from "../i18n/t";
import NavLink from "./NavLink";
import LocaleToggle from "./LocaleToggle";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-head">
      <div className="site-head-row">
        <div className="brand">
          <Link href={`/${locale}`} className="brand-mark">
            igor hasse<span className="dot">.</span>
          </Link>
        </div>
        <nav className="site-nav" aria-label={locale === "en" ? "Main" : "Principal"}>
          <NavLink href="/" localizedHref={`/${locale}`} label={t("nav_archive", locale)} />
          <NavLink
            href="/about"
            localizedHref={`/${locale}/about`}
            label={t("nav_about", locale)}
          />
          <NavLink href="/rss" localizedHref={`/${locale}/rss`} label={t("nav_rss", locale)} />
          <LocaleToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
