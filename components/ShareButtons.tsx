"use client";

import { useEffect, useState } from "react";
import { useT } from "../i18n/useT";
import { buildShareUrl } from "../lib/share-urls";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useT();
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — silent
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ url, title });
    } catch {
      // user cancelled or unsupported — silent
    }
  }

  return (
    <aside className="share-buttons" aria-label={t("share_label")}>
      <span className="share-label">{t("share_label")}</span>
      <ul>
        <li>
          <a href={buildShareUrl("x", url, title)} target="_blank" rel="noopener noreferrer">
            X
          </a>
        </li>
        <li>
          <a href={buildShareUrl("linkedin", url, title)} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={buildShareUrl("whatsapp", url, title)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </li>
        <li>
          <button type="button" onClick={copy}>
            {copied ? t("share_copied") : t("share_copy")}
          </button>
        </li>
        {canNativeShare && (
          <li>
            <button type="button" onClick={nativeShare}>
              {t("share_more")}
            </button>
          </li>
        )}
      </ul>
    </aside>
  );
}
