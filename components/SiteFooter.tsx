import type { Locale } from "../lib/site-config";
import { SITE } from "../lib/site-config";
import { t } from "../i18n/t";

export default function SiteFooter({
  locale,
  withRule = false,
}: {
  locale: Locale;
  withRule?: boolean;
}) {
  return (
    <footer className={`site-foot${withRule ? " with-rule" : ""}`}>
      <span>
        © {new Date().getFullYear()} {SITE.author.displayName}
      </span>
      <div className="site-foot-links">
        <a
          href={`https://github.com/${SITE.author.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("foot_github", locale)}
        </a>
        <a
          href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("foot_twitter", locale)}
        </a>
        <a href={`mailto:${SITE.author.email}`}>{t("foot_email", locale)}</a>
      </div>
    </footer>
  );
}
