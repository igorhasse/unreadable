import Link from "next/link";
import { useRouter } from "next/compat/router";
import ThemeToggle from "./ThemeToggle";
import LocaleToggle from "./LocaleToggle";
import { useT } from "../i18n/useT";
import type { StringKey } from "../i18n/strings";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = router?.pathname ?? "/";
  const t = useT();

  return (
    <header className="site-head">
      <div className="site-head-row">
        <div className="brand">
          <Link href="/" className="brand-mark">
            igor hasse<span className="dot">.</span>
          </Link>
        </div>

        <nav className="site-nav">
          <NavLink href="/" labelKey="nav_archive" active={pathname === "/"} t={t} />
          <NavLink href="/about" labelKey="nav_about" active={pathname.startsWith("/about")} t={t} />
          <NavLink href="/rss" labelKey="nav_rss" active={pathname.startsWith("/rss")} t={t} />
          <LocaleToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  labelKey,
  active,
  t,
}: {
  href: string;
  labelKey: StringKey;
  active?: boolean;
  t: (key: StringKey) => string;
}) {
  return (
    <Link href={href} className={`nav-link${active ? " active" : ""}`}>
      {t(labelKey)}
    </Link>
  );
}
