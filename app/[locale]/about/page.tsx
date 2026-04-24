import type { Metadata } from "next";
import type { Locale } from "../../../lib/site-config";
import { t } from "../../../i18n/t";
import SiteFooter from "../../../components/SiteFooter";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t("nav_about", locale),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        "pt-BR": "/pt-BR/about",
        en: "/en/about",
        "x-default": "/pt-BR/about",
      },
    },
  };
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{t("about_eyebrow", loc)}</div>
        <h1 className="t-title">
          {t("about_title_a", loc)} <em>{t("about_title_em", loc)}</em> {t("about_title_b", loc)}
        </h1>
      </section>

      <section className="prose" style={{ padding: "8px 0 48px" }}>
        <p className="lede">
          {t("about_lede_a", loc)} <em>{t("about_lede_em", loc)}</em>
          {t("about_lede_b", loc)}
        </p>

        <h2>{t("about_h2_blog", loc)}</h2>
        <p>{t("about_blog", loc)}</p>

        <h2>{t("about_h2_now", loc)}</h2>
        <p>{t("about_now", loc)}</p>

        <h2>{t("about_h2_contact", loc)}</h2>
        <p>
          {t("about_contact_a", loc)}{" "}
          <a href="mailto:igor.hasse@gmail.com">{t("about_contact_email", loc)}</a>
          {t("about_contact_b", loc)}{" "}
          <a href="https://twitter.com/deserverd" target="_blank" rel="noopener noreferrer">
            {t("about_contact_twitter", loc)}
          </a>
          {t("about_contact_c", loc)}
        </p>
      </section>

      <SiteFooter locale={loc} withRule />
    </>
  );
}
