export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

function parseFrontmatter(raw: string): { attributes: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: raw };

  const attributes: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      attributes[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { attributes, body: match[2] };
}

const postFiles = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

export interface Post extends PostMeta {
  content: string;
}

export function getPostBySlug(slug: string): Post | null {
  const path = `/content/posts/${slug}.md`;
  const raw = postFiles[path];
  if (!raw) return null;

  const { attributes, body } = parseFrontmatter(raw);
  return {
    slug,
    title: attributes.title || slug,
    date: attributes.date || "",
    description: attributes.description || "",
    content: body,
  };
}

export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];

  for (const [path, raw] of Object.entries(postFiles)) {
    const slug = path.replace("/content/posts/", "").replace(".md", "");
    const { attributes } = parseFrontmatter(raw);

    posts.push({
      slug,
      title: attributes.title || slug,
      date: attributes.date || "",
      description: attributes.description || "",
    });
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
