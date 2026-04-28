/**
 * Single source of truth for site identity.
 * Referenced by metadata, JSON-LD, footer, RSS plugin, about page, etc.
 *
 * To fork this blog: change every value below. Nothing else needs editing
 * downstream — components, metadata generators, RSS plugin, OG templates
 * all read from this file.
 */
export const SITE = {
  /** Production URL, no trailing slash. */
  url: "https://igorhasse.com",
  /** Domain only, used in OG image footers. Derived from `url` at module init. */
  get domain() {
    return this.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  },
  /** Lowercase brand mark (used in header logo and meta og:site_name). */
  name: "igor hasse",
  /** Per-locale tagline used as default page description. */
  description: {
    "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
    en: "Public notes by Igor Hasse on editors, type systems, and software.",
  },
  author: {
    /** Full legal name (used in JSON-LD, RSS author field, OpenGraph authors). */
    name: "Igor Hasse Santiago",
    /** Short display name used in browser titles and footer copyright. */
    displayName: "Igor Hasse",
    email: "igor.hasse@gmail.com",
    twitter: "@deserverd",
    github: "igorhasse",
    linkedin: "https://www.linkedin.com/in/igor-santiago/",
    /** Visible LinkedIn handle without scheme/trailing slash, for link text. */
    linkedinHandle: "linkedin.com/in/igor-santiago",
  },
} as const;

export type Locale = "pt-BR" | "en";

export const LOCALES: readonly Locale[] = ["pt-BR", "en"] as const;
export const DEFAULT_LOCALE: Locale = "pt-BR";

/** Narrow any unknown value to our Locale union, falling back to DEFAULT_LOCALE. */
export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "pt-BR";
}
