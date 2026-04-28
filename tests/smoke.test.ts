import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { redirect: "follow", ...init });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res;
}

describe("smoke: reachability", () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/`, { redirect: "manual" });
    expect([200, 307, 308]).toContain(res.status);
  });

  it.each([
    "/pt-BR",
    "/pt-BR/about",
    "/pt-BR/rss",
    "/pt-BR/posts/eu-escrevo-ia-edita",
    "/en",
    "/en/about",
    "/en/rss",
    "/en/posts/eu-escrevo-ia-edita",
  ])("%s returns 200", async (path) => {
    const res = await fetchOk(`${BASE}${path}`);
    expect(res.status).toBe(200);
  });
});

describe("smoke: locale redirect", () => {
  it("/ with Accept-Language: pt-BR redirects to /pt-BR", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: { "Accept-Language": "pt-BR" },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/pt-BR")).toBe(true);
  });

  it("/ with Accept-Language: en-US redirects to /en", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: { "Accept-Language": "en-US,en;q=0.9" },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/en")).toBe(true);
  });

  it("/ with cookie NEXT_LOCALE=en beats Accept-Language pt-BR", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: {
        "Accept-Language": "pt-BR",
        Cookie: "NEXT_LOCALE=en",
      },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/en")).toBe(true);
  });

  it("/fonts/* is excluded from locale redirect", async () => {
    const res = await fetch(`${BASE}/fonts/jetbrains-mono-latin.woff2`, {
      redirect: "manual",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("font");
  });
});

describe("smoke: HTML head critical tags", () => {
  it("home has canonical, html lang, stylesheet, theme script", async () => {
    const res = await fetchOk(`${BASE}/pt-BR`);
    const html = await res.text();
    expect(html).toMatch(/<html[^>]*lang="pt-BR"/);
    expect(html).toMatch(/<link rel="canonical"/);
    expect(html).toMatch(/<link rel="stylesheet"/);
    expect(html).toContain("blog-theme");
    expect(html).toMatch(/<link rel="alternate" hreflang/i);
  });

  it("post page has JSON-LD", async () => {
    const res = await fetchOk(`${BASE}/pt-BR/posts/eu-escrevo-ia-edita`);
    const html = await res.text();
    expect(html).toContain("application/ld+json");
  });
});

describe("smoke: XML outputs", () => {
  it("/sitemap.xml is valid-ish XML containing both locales", async () => {
    const res = await fetchOk(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("/pt-BR");
    expect(xml).toContain("/en");
  });

  it("/robots.txt references the sitemap", async () => {
    const res = await fetchOk(`${BASE}/robots.txt`);
    const txt = await res.text();
    expect(txt).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/);
  });

  it("/rss.xml and /en/rss.xml both respond with valid RSS", async () => {
    for (const path of ["/rss.xml", "/en/rss.xml"]) {
      const res = await fetchOk(`${BASE}${path}`);
      const xml = await res.text();
      expect(xml).toContain("<?xml");
      expect(xml).toContain("<rss");
      expect(xml).toMatch(/<channel>/);
    }
  });
});
