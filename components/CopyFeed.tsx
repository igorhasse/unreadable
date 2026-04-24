import { useState } from "react";
import { useT } from "../i18n/useT";

export default function CopyFeed({ url }: { url: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="copy-feed">
      <span className="copy-feed-url">{url}</span>
      <button
        type="button"
        className={`copy-feed-btn${copied ? " copied" : ""}`}
        onClick={handleCopy}
      >
        {copied ? t("rss_copied") : t("rss_copy")}
      </button>
    </div>
  );
}
