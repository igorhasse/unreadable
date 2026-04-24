import { describe, it, expect } from "vitest";
import { STRINGS, type StringKey } from "./strings";

describe("STRINGS parity", () => {
  it("pt-BR and en expose exactly the same keys", () => {
    const ptKeys = Object.keys(STRINGS["pt-BR"]).sort();
    const enKeys = Object.keys(STRINGS.en).sort();
    expect(enKeys).toEqual(ptKeys);
  });

  it("no value is an empty string", () => {
    for (const locale of ["pt-BR", "en"] as const) {
      for (const key of Object.keys(STRINGS[locale]) as StringKey[]) {
        expect(STRINGS[locale][key].length).toBeGreaterThan(0);
      }
    }
  });

  it("nav_* keys produce short labels (less than 20 chars)", () => {
    for (const locale of ["pt-BR", "en"] as const) {
      expect(STRINGS[locale].nav_archive.length).toBeLessThan(20);
      expect(STRINGS[locale].nav_about.length).toBeLessThan(20);
      expect(STRINGS[locale].nav_rss.length).toBeLessThan(20);
    }
  });
});
