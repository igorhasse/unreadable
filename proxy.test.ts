import { describe, it, expect } from "vitest";
import { hasLocalePrefix, detectLocale } from "./proxy";

describe("hasLocalePrefix", () => {
  it("matches /pt-BR exact", () => {
    expect(hasLocalePrefix("/pt-BR")).toBe(true);
  });

  it("matches /pt-BR/...", () => {
    expect(hasLocalePrefix("/pt-BR/about")).toBe(true);
    expect(hasLocalePrefix("/pt-BR/posts/foo")).toBe(true);
  });

  it("matches /en exact and subpaths", () => {
    expect(hasLocalePrefix("/en")).toBe(true);
    expect(hasLocalePrefix("/en/about")).toBe(true);
  });

  it("does not match locale-less paths", () => {
    expect(hasLocalePrefix("/")).toBe(false);
    expect(hasLocalePrefix("/about")).toBe(false);
    expect(hasLocalePrefix("/posts/foo")).toBe(false);
  });

  it("does not match bogus locale-like prefixes", () => {
    expect(hasLocalePrefix("/pt-br")).toBe(false);
    expect(hasLocalePrefix("/fr")).toBe(false);
    expect(hasLocalePrefix("/en-US")).toBe(false);
  });
});

describe("detectLocale", () => {
  it("cookie pt-BR wins over Accept-Language", () => {
    expect(detectLocale("pt-BR", "en-US,en;q=0.9")).toBe("pt-BR");
  });

  it("cookie en wins over Accept-Language", () => {
    expect(detectLocale("en", "pt-BR,pt;q=0.9")).toBe("en");
  });

  it("invalid cookie value is ignored, falls back to Accept-Language", () => {
    expect(detectLocale("fr", "pt-BR")).toBe("pt-BR");
    expect(detectLocale("invalid", "en-US")).toBe("en");
  });

  it("Accept-Language pt-BR → pt-BR", () => {
    expect(detectLocale(undefined, "pt-BR")).toBe("pt-BR");
  });

  it("Accept-Language pt-PT → pt-BR (we only have one Portuguese)", () => {
    expect(detectLocale(undefined, "pt-PT")).toBe("pt-BR");
  });

  it("Accept-Language en-US → en", () => {
    expect(detectLocale(undefined, "en-US,en;q=0.9")).toBe("en");
  });

  it("Accept-Language en-GB → en", () => {
    expect(detectLocale(undefined, "en-GB")).toBe("en");
  });

  it("Accept-Language pt takes precedence when both pt and en appear", () => {
    expect(detectLocale(undefined, "pt-BR,en-US;q=0.8")).toBe("pt-BR");
  });

  it("null Accept-Language falls back to default (pt-BR)", () => {
    expect(detectLocale(undefined, null)).toBe("pt-BR");
  });

  it("empty Accept-Language falls back to default", () => {
    expect(detectLocale(undefined, "")).toBe("pt-BR");
  });

  it("unrelated Accept-Language (e.g., French) falls back to default", () => {
    expect(detectLocale(undefined, "fr-FR,fr;q=0.9")).toBe("pt-BR");
  });
});
