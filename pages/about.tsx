import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useT } from "../i18n/useT";

export default function About() {
  const t = useT();
  return (
    <div className="shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-eyebrow">{t("about_eyebrow")}</div>
        <h1 className="t-title">
          {t("about_title_a")} <em>{t("about_title_em")}</em> {t("about_title_b")}
        </h1>
      </section>

      <section className="prose" style={{ padding: "8px 0 48px" }}>
        <p className="lede">
          {t("about_lede_a")} <em>{t("about_lede_em")}</em>{t("about_lede_b")}
        </p>

        <h2>{t("about_h2_blog")}</h2>
        <p>{t("about_blog")}</p>

        <h2>{t("about_h2_now")}</h2>
        <p>{t("about_now")}</p>

        <h2>{t("about_h2_contact")}</h2>
        <p>
          {t("about_contact_a")}{" "}
          <a href="mailto:igor@example.com">{t("about_contact_email")}</a>
          {t("about_contact_b")}{" "}
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
            {t("about_contact_twitter")}
          </a>
          {t("about_contact_c")}
        </p>
      </section>

      <SiteFooter withRule />
    </div>
  );
}
