import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "../../../../lib/site-config";
import { SITE } from "../../../../lib/site-config";
import { getPostBySlug, getTranslatedSlug } from "../../../../lib/posts";
import { renderMarkdown, rewriteAssetPath } from "../../../../lib/markdown";
import { t } from "../../../../i18n/t";
import Newsletter from "../../../../components/Newsletter";
import ProgressBar from "../../../../components/ProgressBar";
import ShareButtons from "../../../../components/ShareButtons";
import SiteFooter from "../../../../components/SiteFooter";
import PostEnhancements from "../../../../components/PostEnhancements";
import PostToc from "../../../../components/PostToc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};

  const ptSlug = getTranslatedSlug(slug, locale, "pt-BR") ?? slug;
  const enSlug = getTranslatedSlug(slug, locale, "en") ?? slug;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/${locale}/posts/${slug}`,
      languages: {
        "pt-BR": `/pt-BR/posts/${ptSlug}`,
        en: `/en/posts/${enSlug}`,
        "x-default": `/pt-BR/posts/${ptSlug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/${locale}/posts/${slug}`,
      publishedTime: post.date,
      authors: [SITE.author.name],
      images: [
        {
          url: `/${locale}/posts/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: SITE.author.twitter,
      images: [`/${locale}/posts/${slug}/opengraph-image`],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;
  const post = getPostBySlug(slug, loc);
  if (!post) notFound();

  const html = await renderMarkdown(post.content, slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.coverImage
      ? `${SITE.url}${post.coverImage.startsWith("/") ? "" : "/"}${post.coverImage}`
      : undefined,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: `${SITE.url}/${loc}/about`,
    },
    publisher: {
      "@type": "Person",
      name: SITE.author.name,
    },
    inLanguage: loc,
    mainEntityOfPage: `${SITE.url}/${loc}/posts/${slug}`,
  };

  const coverSrc = post.coverImage ? rewriteAssetPath(post.coverImage, slug) : undefined;

  return (
    <>
      <ProgressBar />
      <PostToc />
      <Link href={`/${loc}`} className="back">
        {t("post_back", loc)}
      </Link>

      <header className="post-head">
        <div className="post-meta-top">
          <time dateTime={post.date}>{post.dateHuman}</time>
          <span className="dot" />
          <span>{post.readingTime}</span>
          {post.tags[0] && (
            <>
              <span className="dot" />
              <span className="tag">{post.tags[0]}</span>
            </>
          )}
        </div>
        <h1 className="post-title-big">{post.title}</h1>
        {post.description && <p className="post-subtitle">{post.description}</p>}
      </header>

      <article>
        {coverSrc && <img src={coverSrc} alt={post.title} loading="lazy" />}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PostEnhancements />

      <ShareButtons url={`${SITE.url}/${loc}/posts/${slug}`} title={post.title} />
      <Newsletter />
      <SiteFooter locale={loc} />
    </>
  );
}
