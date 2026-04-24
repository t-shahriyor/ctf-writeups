"use client";

import Link from "next/link";
import { ChevronRight, Shield, Folder, Moon, Sun } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { CTFData } from "@/lib/markdown";

export function Sidebar({ data, className }: { data: Record<string, CTFData>, className?: string }) {
  const ctfs = Object.values(data);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleFolder = (name: string) => {
    setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className={className}>
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3 font-semibold text-lg text-[var(--color-heading)]">
          <div className="bg-[var(--color-brand)]/10 p-1.5 rounded-lg text-[var(--color-brand)]">
            <Shield className="w-5 h-5" />
          </div>
          <span className="tracking-tight">CTF Walkthroughs</span>
        </div>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-muted)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ctfs.map((ctf) => (
          <div key={ctf.name} className="space-y-1">
            <button 
              onClick={() => toggleFolder(ctf.name)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-[var(--color-heading)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[var(--color-brand)]" />
                <span>{ctf.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-[var(--color-muted)] transition-transform ${openFolders[ctf.name] ? 'rotate-90' : ''}`} />
            </button>
            
            {openFolders[ctf.name] && (
              <div className="pl-6 space-y-4 mt-2 pb-2">
                {Object.values(ctf.categories).map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <h4 className="flex items-center gap-1 text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-2 ml-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--color-muted)] opacity-50" />
                      {cat.name}
                    </h4>
                    <ul className="space-y-0.5">
                      {cat.walkthroughs.map((w) => (
                        <li key={w.slug}>
                          <Link
                            href={`/${slugify(w.ctf)}/${slugify(w.category)}/${w.slug}`}
                            className="block px-3 py-1.5 rounded-md text-sm text-[var(--color-text)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 transition-colors"
                          >
                            {w.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)] flex justify-center items-center font-medium">
        <span>Powered by uckix</span>
      </div>
    </aside>
  );
}
