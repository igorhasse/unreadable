import { Marked } from "marked";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubDarkDimmed from "shiki/themes/github-dark-dimmed.mjs";
import css from "shiki/langs/css.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";

/**
 * Shiki is bundled with only the languages used by our posts.
 * When a new post uses a new language, add it here:
 *   1. `import <lang> from "shiki/langs/<lang>.mjs";`
 *   2. Add to LANGS below
 *   3. Add to SUPPORTED_LANGS (plus any aliases in normalizeLang)
 */
const LANGS = [css, tsx, typescript, yaml];
const SUPPORTED_LANGS = new Set(["css", "tsx", "typescript", "yaml"]);

let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubDarkDimmed],
      langs: LANGS,
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

function normalizeLang(lang: string): string {
  if (lang === "ts") return "typescript";
  if (lang === "yml") return "yaml";
  return SUPPORTED_LANGS.has(lang) ? lang : "plaintext";
}

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

export async function renderMarkdown(content: string, slug: string): Promise<string> {
  const stripped = content.replace(/^\s*#\s+[^\n]+\n+/, "");
  const marked = makeMarked(slug);
  const highlighter = await getHighlighter();

  const tokens = marked.lexer(stripped);
  for (const token of tokens) {
    if (token.type === "code") {
      const lang = normalizeLang(token.lang || "plaintext");
      const highlighted = highlighter.codeToHtml(token.text, {
        lang,
        theme: "github-dark-dimmed",
      });
      (token as { type: string; raw: string; text: string }).type = "html";
      (token as { type: string; raw: string; text: string }).text = highlighted;
      (token as { type: string; raw: string; text: string }).raw = highlighted;
    }
  }

  const html = marked.parser(tokens);
  return addHeadingIds(html);
}
