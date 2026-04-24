"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
  localizedHref,
}: {
  href: string;
  label: string;
  localizedHref: string;
}) {
  const pathname = usePathname() ?? "";
  // `href` is locale-less (e.g., "/about"). `localizedHref` already has the
  // locale prefix for the actual link. Active state compares against the
  // part of the pathname after the locale.
  const pathAfterLocale = pathname.replace(/^\/(pt-BR|en)/, "") || "/";
  const active = href === "/" ? pathAfterLocale === "/" : pathAfterLocale.startsWith(href);
  return (
    <Link href={localizedHref} className={`nav-link${active ? " active" : ""}`}>
      {label}
    </Link>
  );
}
