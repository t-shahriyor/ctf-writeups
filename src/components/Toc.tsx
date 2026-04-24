"use client";

import { useEffect, useState } from "react";
import type { TOCItem } from "@/lib/markdown";

export function Toc({ headings }: { headings: TOCItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-8 pb-8 pt-12 self-start sticky top-0 max-h-screen overflow-y-auto">
      <h5 className="uppercase text-xs font-semibold text-[var(--color-heading)] tracking-wider mb-4">
        On this page
      </h5>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block hover:text-[var(--color-brand)] transition-colors ${
                activeId === heading.id
                  ? "text-[var(--color-brand)] font-medium"
                  : "text-[var(--color-muted)]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
