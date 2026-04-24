import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <h1 className="t-title">Post not found / Post não encontrado</h1>
      <div className="hero-meta">
        <Link href="/">← back to archive / voltar ao índice</Link>
      </div>
    </section>
  );
}
