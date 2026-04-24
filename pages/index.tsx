import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PostRow from "../components/PostRow";
import Newsletter from "../components/Newsletter";
import { getAllPosts } from "../lib/posts";
import { useLocale } from "../i18n/useT";

export default function Home() {
  const locale = useLocale();
  const posts = getAllPosts(locale);

  return (
    <div className="shell">
      <SiteHeader />

      <div className="posts">
        {posts.map((p, i) => (
          <PostRow key={p.slug} post={p} index={i} />
        ))}
      </div>

      <Newsletter variant="full" />

      <SiteFooter />
    </div>
  );
}
