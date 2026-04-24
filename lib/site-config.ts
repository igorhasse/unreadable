/**
 * Single source of truth for site identity.
 * Referenced by metadata, JSON-LD, footer, RSS plugin, about page, etc.
 * Update values here; everywhere else reads from this file.
 */
export const SITE = {
  url: "https://igorhasse.com",
  name: "igor hasse",
  description: {
    "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
    "en": "Public notes by Igor Hasse on editors, type systems, and software.",
  },
  author: {
    name: "Igor Hasse Santiago",
    email: "igor.hasse@gmail.com",
    twitter: "@deserverd",
    github: "igorhasse",
    linkedin: "https://www.linkedin.com/in/igor-santiago/",
  },
} as const;

export type Locale = "pt-BR" | "en";

export const LOCALES: readonly Locale[] = ["pt-BR", "en"] as const;
export const DEFAULT_LOCALE: Locale = "pt-BR";

/** Narrow any unknown value to our Locale union, falling back to DEFAULT_LOCALE. */
export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "pt-BR";
}
