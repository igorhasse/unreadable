import { useEffect } from "react";
import { useRouter } from "next/compat/router";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ProgressBar from "../../components/ProgressBar";
import Newsletter from "../../components/Newsletter";
import { getPostBySlug } from "../../lib/posts";
import { renderMarkdown } from "../../lib/markdown";
import { useT, useLocale } from "../../i18n/useT";

export default function PostPage() {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const slug = typeof router?.query.slug === "string" ? router.query.slug : undefined;
  const post = slug ? getPostBySlug(slug, locale) : null;

  useEffect(() => {
    if (!post) return;
    const headings = document.querySelectorAll<HTMLElement>(
      ".prose h2[id], .prose h3[id]",
    );
    headings.forEach((h) => {
      if (h.querySelector(".anchor")) return;
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.className = "anchor";
      a.textContent = "#";
      a.title = locale === "en" ? "Copy link to this section" : "Copiar link desta seção";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const url = location.href.split("#")[0] + "#" + h.id;
        try {
          navigator.clipboard.writeText(url);
        } catch {}
        a.textContent = "✓";
        setTimeout(() => (a.textContent = "#"), 1200);
      });
      h.appendChild(a);
    });
  }, [post, locale]);

  // Client-side syntax highlighting. highlight.js is CJS-only under the hood
  // so we can't run it during SSR with Vite 8; dynamic-import it after hydration.
  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    (async () => {
      const { default: hljs } = await import("highlight.js/lib/common");
      if (cancelled) return;
      document.querySelectorAll<HTMLElement>(".prose pre code").forEach((el) => {
        if (el.dataset.highlighted === "yes") return;
        hljs.highlightElement(el);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [post]);

  if (!post) {
    return (
      <div className="shell">
        <SiteHeader />
        <section className="hero">
          <h1 className="t-title">{t("post_not_found_title")}</h1>
          <div className="hero-meta">
            <Link href="/">{t("post_not_found_back")}</Link>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const html = renderMarkdown(post.content);

  return (
    <>
      <ProgressBar />
      <div className="shell">
        <SiteHeader />

        <Link href="/" className="back">{t("post_back")}</Link>

        <header className="post-head">
          <div className="post-meta-top">
            <time>{post.dateHuman}</time>
            <span className="dot" />
            <span>{post.readingTime}</span>
            {post.tags[0] && (
              <>
                <span className="dot" />
                <span className="tag">{post.tags[0]}</span>
              </>
            )}
          </div>

          <h1 className="post-title-big">{post.title}</h1>

          {post.description && <p className="post-subtitle">{post.description}</p>}
        </header>

        <article>
          {post.coverImage && <img src={post.coverImage} alt={post.title} loading="lazy" />}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <Newsletter variant="compact" />

        <SiteFooter withRule />
      </div>
    </>
  );
}
