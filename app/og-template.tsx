import { ImageResponse } from "next/og";
import type { Locale } from "../lib/site-config";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOGImage({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#131313",
        color: "#ebe8e4",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 20, color: "#d4a259", letterSpacing: 3, textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 500,
          lineHeight: 1.15,
          marginTop: 40,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 28, color: "#8a8680", marginTop: 24, lineHeight: 1.35 }}>
          {subtitle}
        </div>
      )}
      <div style={{ marginTop: "auto", fontSize: 20, color: "#585551", letterSpacing: "0.04em" }}>
        {footer}
      </div>
    </div>,
    OG_SIZE
  );
}

export function formatOGEyebrow(locale: Locale, section?: string): string {
  const langLabel = locale === "en" ? "EN" : "PT-BR";
  return section ? `IGOR HASSE · ${section} · ${langLabel}` : `IGOR HASSE · ${langLabel}`;
}
