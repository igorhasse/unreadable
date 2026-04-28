"use client";

import { useEffect, useState } from "react";
import { useT } from "../i18n/useT";

type Heading = { id: string; text: string };

export default function PostToc() {
  const t = useT();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLHeadingElement>(".prose h2[id]"));
    if (els.length === 0) return;

    setHeadings(
      els.map((h) => ({
        id: h.id,
        text: (h.textContent ?? "").trim(),
      }))
    );
    setActiveId(els[0].id);

    // Position-based "current section" detection. Instead of relying on an
    // entry being `isIntersecting` at the moment of the observer fire, we
    // re-evaluate every fire by querying live DOM positions: the active
    // heading is the last one whose top has crossed above the trigger line.
    // This survives smooth-scroll-after-click without getting stuck.
    const TRIGGER_OFFSET = 100;
    function update() {
      const positions = els.map((el) => ({
        id: el.id,
        top: el.getBoundingClientRect().top,
      }));
      const above = positions.filter((p) => p.top < TRIGGER_OFFSET);
      if (above.length > 0) {
        setActiveId(above[above.length - 1].id);
      } else {
        setActiveId(els[0].id);
      }
    }

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${TRIGGER_OFFSET}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <aside className="post-toc" aria-label={t("toc_label")}>
      <span className="post-toc-label">{t("toc_label")}</span>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={h.id === activeId ? "active" : ""}>
            <a href={`#${h.id}`} onClick={() => setActiveId(h.id)}>
              {h.text}
            </a>
          </li>
        ))}
        <li className="post-toc-top">
          <button type="button" onClick={backToTop}>
            ↑ {t("toc_back_to_top")}
          </button>
        </li>
      </ul>
    </aside>
  );
}
