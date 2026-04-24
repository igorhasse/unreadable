import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CopyFeed from "../components/CopyFeed";
import { useT, useLocale } from "../i18n/useT";

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

export default function RssPage() {
  const t = useT();
  const locale = useLocale();
  const feedUrl = locale === "en" ? "https://igorhasse.com/en/rss.xml" : "https://igorhasse.com/rss.xml";
  const readers = locale === "en" ? READERS_EN : READERS_PT;

  return (
    <div className="shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-eyebrow">{t("rss_eyebrow")}</div>
        <h1 className="t-title">
          {t("rss_title_a")} <em>{t("rss_title_em")}</em>{t("rss_title_b")}
        </h1>
        <p className="post-subtitle" style={{ marginTop: 20, maxWidth: 560 }}>
          {t("rss_subtitle")}
        </p>
        <CopyFeed url={feedUrl} />
      </section>

      <div className="list-head">
        <h2 className="list-title">{t("rss_readers_head")}</h2>
        <span className="list-count">{String(readers.length).padStart(2, "0")} {t("rss_readers_count_suffix")}</span>
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
            <span className="reader-cta">{t("rss_reader_cta")}</span>
          </a>
        ))}
      </div>

      <SiteFooter withRule />
    </div>
  );
}
