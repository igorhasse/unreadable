import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-surface-container-low">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          Blog
        </Link>
        <Link
          href="/about"
          className="font-meta text-sm text-on-surface-variant hover:text-primary"
        >
          About Me
        </Link>
      </nav>
    </header>
  );
}
