"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";

export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-9 px-3 flex items-center gap-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:border-[var(--color-brand)] transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-sans font-semibold bg-[#2d313a] border border-[var(--color-border)] rounded text-[var(--color-muted)]">
          Ctrl K
        </kbd>
      </button>
      <SearchModal open={open} setOpen={setOpen} />
    </>
  );
}
