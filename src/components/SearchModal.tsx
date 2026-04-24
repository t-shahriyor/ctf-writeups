"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { Search, X, FileText } from "lucide-react";
import { slugify } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export function SearchModal({ open, setOpen }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);

  useEffect(() => {
    if (open && data.length === 0) {
      fetch("/api/search")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setFuse(
            new Fuse(json, {
              keys: ["title", "ctf", "category"],
              threshold: 0.3,
            })
          );
        });
    }
  }, [open, data.length]);

  useEffect(() => {
    if (fuse && query) {
      setResults(fuse.search(query).map((r) => r.item));
    } else {
      setResults([]);
    }
  }, [query, fuse]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-24 sm:pt-32 px-4">
      <div 
        className="fixed inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center px-4 border-b border-[var(--color-border)]">
          <Search className="w-5 h-5 text-[var(--color-muted)]" />
          <input
            type="text"
            className="flex-1 bg-transparent border-0 px-4 py-4 text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            placeholder="Search walkthroughs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={() => setOpen(false)} className="text-[var(--color-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {results.length > 0 && (
          <div className="overflow-y-auto p-2">
            {results.map((item) => (
              <Link
                key={item.filePath}
                href={`/${slugify(item.ctf)}/${slugify(item.category)}/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2d313a] text-left transition-colors"
              >
                <FileText className="w-5 h-5 text-[var(--color-muted)]" />
                <div>
                  <div className="text-[var(--color-heading)] font-medium">{item.title}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {item.ctf} &rsaquo; {item.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="p-8 text-center text-[var(--color-muted)] text-sm">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
