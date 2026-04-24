import Link from "next/link";
import type { Locale } from "../lib/site-config";
import type { PostMeta } from "../lib/posts";

export default function PostRow({ post, index }: { post: PostMeta; index: number }) {
  const locale: Locale = post.locale;
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="post-row">
      <div className="post-row-top">
        <span className="post-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="post-dot" />
        <time dateTime={post.date}>{post.dateHuman}</time>
        <span className="post-dot" />
        <span>{post.readingTime}</span>
        {post.tags[0] && (
          <>
            <span className="post-dot" />
            <span className="post-tag">{post.tags[0]}</span>
          </>
        )}
      </div>
      <h3 className="post-title">{post.title}</h3>
      {post.description && <p className="post-desc">{post.description}</p>}
    </Link>
  );
}
