import type { Locale } from "../../lib/site-config";
import { getAllPosts } from "../../lib/posts";
import PostRow from "../../components/PostRow";
import Newsletter from "../../components/Newsletter";
import SiteFooter from "../../components/SiteFooter";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = getAllPosts(locale);

  return (
    <>
      <div className="posts">
        {posts.map((p, i) => (
          <PostRow key={p.slug} post={p} index={i} />
        ))}
      </div>
      <Newsletter />
      <SiteFooter locale={locale} />
    </>
  );
}
