import type { Metadata } from "next";
import type { Locale } from "../../../lib/site-config";
import { SITE } from "../../../lib/site-config";
import { t } from "../../../i18n/t";
import CopyFeed from "../../../components/CopyFeed";
import SiteFooter from "../../../components/SiteFooter";
import { notFound } from "next/navigation";

const READERS_PT = [
  { name: "NetNewsWire", desc: "Grátis, open-source. Mac e iOS.", href: "https://netnewswire.com" },
  { name: "Feedbin", desc: "Web + apps nativos. $5/mês.", href: "https://feedbin.com" },
  { name: "Reeder 5", desc: "Apple-first, elegante.", href: "https://reederapp.com" },
  { name: "Inoreader", desc: "Web-based, plano grátis generoso.", href: "https://inoreader.com" },
  { name: "Feedly", desc: "O mais popular. Interface limpa.", href: "https://feedly.com" },
  { name: "Miniflux", desc: "Self-hosted, minimalista.", href: "https://miniflux.app" },
];

const READERS_EN = [
  { name: "NetNewsWire", desc: "Free, open-source. Mac and iOS.", href: "https://netnewswire.com" },
  { name: "Feedbin", desc: "Web + native apps. $5/month.", href: "https://feedbin.com" },
  { name: "Reeder 5", desc: "Apple-first, elegant.", href: "https://reederapp.com" },
  { name: "Inoreader", desc: "Web-based, generous free plan.", href: "https://inoreader.com" },
  { name: "Feedly", desc: "Most popular. Clean interface.", href: "https://feedly.com" },
  { name: "Miniflux", desc: "Self-hosted, minimal.", href: "https://miniflux.app" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RSS",
    alternates: {
      canonical: `/${locale}/rss`,
      languages: {
        "pt-BR": "/pt-BR/rss",
        en: "/en/rss",
        "x-default": "/pt-BR/rss",
      },
    },
  };
}

export default async function RssPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;
  const feedUrl = loc === "en" ? `${SITE.url}/en/rss.xml` : `${SITE.url}/rss.xml`;
  const readers = loc === "en" ? READERS_EN : READERS_PT;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{t("rss_eyebrow", loc)}</div>
        <h1 className="t-title">
          {t("rss_title_a", loc)} <em>{t("rss_title_em", loc)}</em>
          {t("rss_title_b", loc)}
        </h1>
        <p className="post-subtitle" style={{ marginTop: 20, maxWidth: 560 }}>
          {t("rss_subtitle", loc)}
        </p>
        <CopyFeed url={feedUrl} />
      </section>

      <div className="list-head">
        <h2 className="list-title">{t("rss_readers_head", loc)}</h2>
        <span className="list-count">
          {String(readers.length).padStart(2, "0")} {t("rss_readers_count_suffix", loc)}
        </span>
      </div>

      <div className="reader-grid">
        {readers.map((r) => (
          <a
            key={r.name}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="reader-card"
          >
            <span className="reader-name">{r.name}</span>
            <span className="reader-desc">{r.desc}</span>
            <span className="reader-cta">{t("rss_reader_cta", loc)}</span>
          </a>
        ))}
      </div>

      <SiteFooter locale={loc} withRule />
    </>
  );
}
