import type { Locale } from "../lib/site-config";
import { STRINGS, type StringKey } from "./strings";

/**
 * Server-side translator. Used by Server Components (layout, pages, any
 * non-'use client' component). Receives the locale explicitly.
 */
export function t(key: StringKey, locale: Locale): string {
  return STRINGS[locale][key];
}
