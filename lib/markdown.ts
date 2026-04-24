import { Marked } from "marked";
import { codeToHtml } from "shiki";

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Rewrite markdown-relative asset paths (./foo.png) to the public URL
 * (/posts/<slug>/foo.png). The assetsPlugin in vite.config.ts copies
 * non-markdown files from content/posts/<slug>/ to public/posts/<slug>/ at
 * build/dev time, so this path is valid at runtime.
 */
export function rewriteAssetPath(src: string, slug: string): string {
  if (src.startsWith("./")) return `/posts/${slug}/${src.slice(2)}`;
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/posts/${slug}/${src}`;
}

function makeMarked(slug: string): Marked {
  return new Marked({
    renderer: {
      image({ href, title, text }: { href: string; title?: string | null; text: string }) {
        const resolved = rewriteAssetPath(href, slug);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" />`;
      },
    },
  });
}

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const slug = slugifyHeading(text);
    return slug ? `<${tag} id="${slug}">${inner}</${tag}>` : `<${tag}>${inner}</${tag}>`;
  });
}

/**
 * Two-pass render:
 *  1. Walk tokens, replace each code block with shiki-highlighted HTML.
 *  2. Parse the remaining markdown via marked with our custom renderer.
 *
 * Shiki's codeToHtml is async, so the whole pipeline is async.
 */
export async function renderMarkdown(content: string, slug: string): Promise<string> {
  const stripped = content.replace(/^\s*#\s+[^\n]+\n+/, "");
  const marked = makeMarked(slug);

  // Pre-highlight code blocks by replacing them with pre-rendered HTML tokens.
  const tokens = marked.lexer(stripped);
  for (const token of tokens) {
    if (token.type === "code") {
      const lang = token.lang || "plaintext";
      const highlighted = await codeToHtml(token.text, {
        lang,
        theme: "github-dark-dimmed",
      });
      // Mark as raw HTML so marked.parser doesn't re-encode it.
      (token as { type: string; raw: string; text: string }).type = "html";
      (token as { type: string; raw: string; text: string }).text = highlighted;
      (token as { type: string; raw: string; text: string }).raw = highlighted;
    }
  }

  const html = marked.parser(tokens);
  return addHeadingIds(html);
}
