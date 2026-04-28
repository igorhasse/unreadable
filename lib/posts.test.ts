import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug, getTranslatedSlug } from "./posts";

describe("getPostBySlug", () => {
  it("returns a post when slug + locale match a file", () => {
    const post = getPostBySlug("eu-escrevo-ia-edita", "pt-BR");
    expect(post).not.toBeNull();
    expect(post?.slug).toBe("eu-escrevo-ia-edita");
    expect(post?.locale).toBe("pt-BR");
    expect(post?.title).toBeTruthy();
  });

  it("returns null for a non-existent slug", () => {
    const post = getPostBySlug("does-not-exist-xyz", "pt-BR");
    expect(post).toBeNull();
  });

  it("returns different content for different locales of the same slug", () => {
    const pt = getPostBySlug("eu-escrevo-ia-edita", "pt-BR");
    const en = getPostBySlug("eu-escrevo-ia-edita", "en");
    expect(pt).not.toBeNull();
    expect(en).not.toBeNull();
    expect(pt!.content).not.toBe(en!.content);
  });

  it("produces dateHuman in Portuguese month format for pt-BR", () => {
    const post = getPostBySlug("eu-escrevo-ia-edita", "pt-BR");
    expect(post?.dateHuman).toMatch(
      /\d{2} (Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) \d{4}/
    );
  });

  it("produces dateHuman in English month format for en", () => {
    const post = getPostBySlug("eu-escrevo-ia-edita", "en");
    expect(post?.dateHuman).toMatch(
      /\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/
    );
  });

  it("readingTime string contains 'min' in pt-BR", () => {
    const post = getPostBySlug("eu-escrevo-ia-edita", "pt-BR");
    expect(post?.readingTime).toMatch(/\d+ min de leitura/);
  });

  it("readingTime string contains 'min read' in en", () => {
    const post = getPostBySlug("eu-escrevo-ia-edita", "en");
    expect(post?.readingTime).toMatch(/\d+ min read/);
  });
});

describe("getAllPosts", () => {
  it("returns a non-empty array for pt-BR", () => {
    const posts = getAllPosts("pt-BR");
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("returns posts only for the requested locale", () => {
    const posts = getAllPosts("pt-BR");
    expect(posts.every((p) => p.locale === "pt-BR")).toBe(true);
  });

  it("sorts posts by date descending", () => {
    const posts = getAllPosts("pt-BR");
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].date >= posts[i + 1].date).toBe(true);
    }
  });

  it("every post has required fields", () => {
    const posts = getAllPosts("pt-BR");
    for (const post of posts) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.dateHuman).toBeTruthy();
      expect(post.readingTime).toBeTruthy();
      expect(post.locale).toBe("pt-BR");
    }
  });

  it("pt-BR and en have the same number of posts (paridade total)", () => {
    const pt = getAllPosts("pt-BR");
    const en = getAllPosts("en");
    expect(pt.length).toBe(en.length);
  });
});

describe("getTranslatedSlug", () => {
  it("returns the same slug when target locale has the file", () => {
    const result = getTranslatedSlug("eu-escrevo-ia-edita", "pt-BR", "en");
    expect(result).toBe("eu-escrevo-ia-edita");
  });

  it("returns null when target locale doesn't have the file", () => {
    const result = getTranslatedSlug("does-not-exist-xyz", "pt-BR", "en");
    expect(result).toBeNull();
  });

  it("returns the same slug when source and target are the same", () => {
    const result = getTranslatedSlug("eu-escrevo-ia-edita", "pt-BR", "pt-BR");
    expect(result).toBe("eu-escrevo-ia-edita");
  });
});
