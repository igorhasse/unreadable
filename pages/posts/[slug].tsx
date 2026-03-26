import { useRouter } from "next/router";
import Link from "next/link";
import { getPostBySlug } from "../../lib/posts";
import { renderMarkdown } from "../../lib/markdown";
import Newsletter from "../../components/Newsletter";

export default function PostPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-primary">
          Post not found
        </h1>
        <Link href="/" className="mt-6 inline-block text-muted hover:text-on-surface-variant transition-colors">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Link href="/" className="font-meta text-sm text-muted hover:text-on-surface-variant transition-colors">
        &larr; Back to home
      </Link>

      <header className="mt-8">
        <time className="font-meta text-sm text-muted">{post.date}</time>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 text-lg text-on-surface-variant">{post.description}</p>
        )}
      </header>

      <div
        className="prose mt-12"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-16">
        <Newsletter />
      </div>
    </article>
  );
}
