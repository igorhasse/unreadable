import Link from "next/link";
import { useRouter } from "next/compat/router";
import { useLocale } from "../i18n/useT";
import { getTranslatedSlug, type Locale } from "../lib/posts";

/**
 * Compute the path to the equivalent page in the target locale. We strip
 * any locale prefix so <Link locale={target}> can add the right one.
 * For post pages we consult getTranslatedSlug so slugs can differ across
 * locales; for everything else the same path works in both.
 */
function hrefInLocale(
  pathname: string,
  asPath: string,
  slug: string | undefined,
  target: Locale,
  current: Locale,
): string {
  if (pathname === "/posts/[slug]" && slug) {
    const translated = getTranslatedSlug(slug, current, target);
    return translated ? `/posts/${translated}` : "/";
  }
  const bare = (asPath || "/").split("?")[0].split("#")[0];
  if (current === "en") return bare.replace(/^\/en(\/|$)/, "/") || "/";
  return bare || "/";
}

export default function LocaleToggle() {
  const router = useRouter();
  const current = useLocale();
  const pathname = router?.pathname ?? "/";
  const asPath = router?.asPath ?? "/";
  const slug = typeof router?.query.slug === "string" ? router.query.slug : undefined;

  const ptHref = hrefInLocale(pathname, asPath, slug, "pt-BR", current);
  const enHref = hrefInLocale(pathname, asPath, slug, "en", current);

  return (
    <span className="locale-toggle" aria-label={current === "en" ? "Switch language" : "Trocar idioma"}>
      <Link
        href={ptHref}
        locale="pt-BR"
        className={`locale-toggle-btn${current === "pt-BR" ? " active" : ""}`}
      >
        PT
      </Link>
      <span className="locale-toggle-sep" aria-hidden="true">|</span>
      <Link
        href={enHref}
        locale="en"
        className={`locale-toggle-btn${current === "en" ? " active" : ""}`}
      >
        EN
      </Link>
    </span>
  );
}
