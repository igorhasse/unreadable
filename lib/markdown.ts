import { Marked } from "marked";
// Syntax highlighting runs client-side (see pages/posts/[slug].tsx). Vite
// 8's strict ESM SSR evaluator can't load highlight.js (its "ESM" entry just
// re-exports CJS), so we emit plain <code class="language-X"> here and let
// the client upgrade it after hydration.

function slugify(text: string): string {
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

const marked = new Marked({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang ?? "plaintext";
      return `<pre><code class="hljs language-${language}">${escapeHtml(text)}</code></pre>`;
    },
    image({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" />`;
    },
  },
});

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const slug = slugify(text);
    return slug ? `<${tag} id="${slug}">${inner}</${tag}>` : `<${tag}>${inner}</${tag}>`;
  });
}

export function renderMarkdown(content: string): string {
  const stripped = content.replace(/^\s*#\s+[^\n]+\n+/, "");
  return addHeadingIds(marked.parse(stripped) as string);
}
