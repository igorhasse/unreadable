import type { Locale } from "../../../lib/site-config";
import { SITE } from "../../../lib/site-config";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../og-template";
import { t } from "../../../i18n/t";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return renderOGImage({
    eyebrow: formatOGEyebrow(locale, "RSS"),
    title: t("rss_title_a", locale) + " " + t("rss_title_em", locale) + t("rss_title_b", locale),
    footer: `${SITE.domain}/rss`,
  });
}
