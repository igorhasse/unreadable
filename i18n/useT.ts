import { useRouter } from "next/compat/router";
import type { Locale } from "../lib/posts";
import { STRINGS, type StringKey } from "./strings";

/**
 * Why next/compat/router: vinext wraps the page element in a
 * RouterContext.Provider (via wrapWithRouterContext) BEFORE clearing the
 * SSR context. That provider snapshots pathname, query, locale, etc. and
 * survives the clear, so useRouter() from next/compat/router returns
 * correct values during body-stream SSR.
 *
 * next/router's useRouter() reads live SSR state instead and returns empty
 * values during body render — use the compat version everywhere except in
 * _document.tsx (which renders as part of the shell, before the clear).
 */
export function useLocale(): Locale {
  const router = useRouter();
  return router?.locale === "en" ? "en" : "pt-BR";
}

/**
 * Hook returning a translator bound to the current locale.
 *
 *   const t = useT();
 *   <span>{t("nav_archive")}</span>
 */
export function useT(): (key: StringKey) => string {
  const locale = useLocale();
  return (key) => STRINGS[locale][key];
}
