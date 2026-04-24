"use client";

import { useParams } from "next/navigation";
import type { Locale } from "../lib/site-config";
import { STRINGS, type StringKey } from "./strings";

/**
 * Client-side translator hook. Reads locale from route params (injected by
 * vinext's navigation shim into the RouterContext snapshot, which survives
 * across body SSR in App Router).
 */
export function useLocale(): Locale {
  const params = useParams<{ locale?: Locale }>();
  return params?.locale === "en" ? "en" : "pt-BR";
}

export function useT(): (key: StringKey) => string {
  const locale = useLocale();
  return (key) => STRINGS[locale][key];
}
