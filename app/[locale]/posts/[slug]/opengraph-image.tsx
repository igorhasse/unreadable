import type { Locale } from "../../../../lib/site-config";
import { getPostBySlug } from "../../../../lib/posts";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../../og-template";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) {
    return renderOGImage({
      eyebrow: formatOGEyebrow(locale),
      title: "Post",
      footer: "igorhasse.com",
    });
  }

  return renderOGImage({
    eyebrow: formatOGEyebrow(locale),
    title: post.title,
    subtitle: post.description,
    footer: `igorhasse.com · ${post.dateHuman}`,
  });
}
