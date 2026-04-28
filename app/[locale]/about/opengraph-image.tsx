import type { Locale } from "../../../lib/site-config";
import { SITE } from "../../../lib/site-config";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../og-template";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return renderOGImage({
    eyebrow: formatOGEyebrow(locale, "ABOUT"),
    title: locale === "pt-BR" ? "Engenheiro antes de blogueiro." : "Engineer before blogger.",
    footer: `${SITE.domain}/about`,
  });
}
