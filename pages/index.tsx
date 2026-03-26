import Link from "next/link";
import { getAllPosts } from "../lib/posts";
import Newsletter from "../components/Newsletter";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-5xl font-bold text-primary">Blog</h1>
      <p className="mt-4 text-on-surface-variant">
        Thoughts on web development, technology, and more.
      </p>

      <div className="mt-16 flex flex-col gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block rounded-2xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container"
          >
            <time className="font-meta text-sm text-muted">{post.date}</time>
            <h2 className="mt-2 font-display text-2xl font-semibold text-primary group-hover:text-primary-container transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-on-surface-variant leading-relaxed">
              {post.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <Newsletter />
      </div>
    </div>
  );
}
