"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Injects clickable anchor links into each h2/h3 inside .prose that has an
 * id. Clicking copies the section's URL to the clipboard and briefly shows ✓.
 * Syntax highlighting is server-side (shiki), so nothing to do here for code.
 */
export default function PostEnhancements() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "en" ? "en" : "pt-BR";

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]");
    const cleanups: Array<() => void> = [];

    headings.forEach((h) => {
      if (h.querySelector(".anchor")) return;
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.className = "anchor";
      a.textContent = "#";
      a.title = locale === "en" ? "Copy link to this section" : "Copiar link desta seção";
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        const url = location.href.split("#")[0] + "#" + h.id;
        navigator.clipboard?.writeText(url).catch(() => {});
        a.textContent = "✓";
        setTimeout(() => (a.textContent = "#"), 1200);
      };
      a.addEventListener("click", onClick);
      h.appendChild(a);
      cleanups.push(() => {
        a.removeEventListener("click", onClick);
        a.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [locale]);

  return null;
}
