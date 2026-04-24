import { getSidebarData } from "@/lib/markdown";
import Link from "next/link";
import { SearchButton } from "./SearchButton";
import { ChevronRight, Shield, Folder } from "lucide-react";
import { slugify } from "@/lib/utils";

export function Sidebar({ className }: { className?: string }) {
  const data = getSidebarData();
  const ctfs = Object.values(data);

  return (
    <aside className={className}>
      <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2 font-semibold text-lg">
        <Shield className="w-5 h-5 text-[var(--color-brand)]" />
        <span>Walkthroughs</span>
      </div>
      
      <div className="p-4 border-b border-[var(--color-border)]">
        <SearchButton />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {ctfs.map((ctf) => (
          <div key={ctf.name} className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--color-heading)] flex items-center gap-2">
              <Folder className="w-4 h-4 text-[var(--color-muted)]" />
              {ctf.name}
            </h3>
            <div className="pl-6 space-y-4">
              {Object.values(ctf.categories).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <h4 className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-medium mb-1">
                    {cat.name}
                  </h4>
                  <ul className="space-y-1">
                    {cat.walkthroughs.map((w) => (
                      <li key={w.slug}>
                        <Link
                          href={`/${slugify(w.ctf)}/${slugify(w.category)}/${w.slug}`}
                          className="block text-sm text-[var(--color-text)] hover:text-[var(--color-brand)] py-1 transition-colors"
                        >
                          {w.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)] flex justify-between items-center">
        <span>Powered by myself</span>
      </div>
    </aside>
  );
}
