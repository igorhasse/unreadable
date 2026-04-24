import { useT } from "../i18n/useT";

export default function SiteFooter({ withRule = false }: { withRule?: boolean }) {
  const t = useT();
  return (
    <footer className={`site-foot${withRule ? " with-rule" : ""}`}>
      <span>© {new Date().getFullYear()} {t("foot_copyright")}</span>
      <div className="site-foot-links">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">{t("foot_github")}</a>
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">{t("foot_twitter")}</a>
        <a href="mailto:igor@example.com">{t("foot_email")}</a>
      </div>
    </footer>
  );
}
