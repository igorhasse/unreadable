import { describe, it, expect } from "vitest";
import { renderMarkdown, rewriteAssetPath } from "./markdown";

describe("rewriteAssetPath", () => {
  it("rewrites ./foo.png to /posts/<slug>/foo.png", () => {
    expect(rewriteAssetPath("./foo.png", "my-post")).toBe("/posts/my-post/foo.png");
  });

  it("keeps absolute URLs untouched", () => {
    expect(rewriteAssetPath("https://example.com/x.jpg", "s")).toBe("https://example.com/x.jpg");
    expect(rewriteAssetPath("http://cdn.io/a.webp", "s")).toBe("http://cdn.io/a.webp");
  });

  it("keeps root-absolute paths untouched", () => {
    expect(rewriteAssetPath("/favicon.svg", "s")).toBe("/favicon.svg");
  });

  it("treats bare names as relative to the post folder", () => {
    expect(rewriteAssetPath("cover.jpg", "my-post")).toBe("/posts/my-post/cover.jpg");
  });
});

describe("renderMarkdown", () => {
  it("renders headings with id attributes", async () => {
    const html = await renderMarkdown("## Hello World", "some-slug");
    expect(html).toContain('id="hello-world"');
  });

  it("strips the initial H1 if present (title already rendered by page)", async () => {
    const html = await renderMarkdown("# Title\n\n## Real Content", "some-slug");
    expect(html).not.toContain("<h1>Title</h1>");
    expect(html).toContain('<h2 id="real-content">Real Content</h2>');
  });

  it("slugifies headings with accents and punctuation", async () => {
    const html = await renderMarkdown("## Olá, mundo! Já?", "s");
    expect(html).toContain('id="ola-mundo-ja"');
  });

  it("wraps code blocks with shiki-highlighted spans", async () => {
    const html = await renderMarkdown("```ts\nconst x = 1;\n```", "s");
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toMatch(/style="[^"]*color:#[0-9a-fA-F]{6}/);
  });

  it("rewrites relative image paths in markdown to /posts/<slug>/", async () => {
    const html = await renderMarkdown("![alt](./diagram.png)", "my-post");
    expect(html).toContain('src="/posts/my-post/diagram.png"');
    expect(html).toContain('alt="alt"');
    expect(html).toContain('loading="lazy"');
  });

  it("keeps external image URLs untouched", async () => {
    const html = await renderMarkdown("![alt](https://example.com/x.jpg)", "s");
    expect(html).toContain('src="https://example.com/x.jpg"');
  });

  it("handles plaintext code blocks without error", async () => {
    const html = await renderMarkdown("```\nhello\n```", "s");
    expect(html).toContain("<pre");
  });
});
