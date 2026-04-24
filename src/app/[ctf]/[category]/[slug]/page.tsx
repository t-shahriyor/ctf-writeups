import { getAllWalkthroughs, getWalkthroughBySlug, extractHeadings } from "@/lib/markdown";
import { slugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Toc } from "@/components/Toc";
import { ChevronRight } from "lucide-react";

export async function generateStaticParams() {
  const all = getAllWalkthroughs();
  return all.map((w) => ({
    ctf: slugify(w.ctf),
    category: slugify(w.category),
    slug: w.slug,
  }));
}

export default async function WalkthroughPage({
  params,
}: {
  params: Promise<{ ctf: string; category: string; slug: string }>;
}) {
  const { ctf, category, slug } = await params;
  const walkthrough = getWalkthroughBySlug(ctf, category, slug);

  if (!walkthrough) {
    notFound();
  }

  const headings = extractHeadings(walkthrough.content);

  return (
    <div className="flex h-full w-full">
      <article className="flex-1 min-w-0 p-8 md:p-12 w-full max-w-4xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-8">
          <span>{walkthrough.ctf}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[var(--color-brand)]">{walkthrough.category}</span>
        </nav>

        {/* Content Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--color-heading)] mb-6">{walkthrough.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] p-4 rounded-lg">
            {walkthrough.points && (
               <div><span className="text-[var(--color-muted)]">Points:</span> <span className="font-medium text-[var(--color-heading)]">{walkthrough.points}</span></div>
            )}
            {walkthrough.author && (
               <div><span className="text-[var(--color-muted)]">Author:</span> <span className="font-medium text-[var(--color-heading)]">{walkthrough.author}</span></div>
            )}
            {walkthrough.flag && (
               <div>
                 <span className="text-[var(--color-muted)]">Flag:</span> 
                 <code className="ml-2 bg-[#2d313a] px-1.5 py-0.5 rounded text-[var(--color-heading)]">
                   {walkthrough.flag}
                 </code>
               </div>
            )}
          </div>
        </header>

        <div className="prose max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, rehypeHighlight]}
            urlTransform={(url) => {
              // React-markdown default basic url check
              const cleanUrl = url.replace(/^\s+|\s+$/g, '');
              if (cleanUrl.startsWith('/')) {
                return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${cleanUrl}`;
              }
              return cleanUrl;
            }}
          >
            {walkthrough.content}
          </ReactMarkdown>
        </div>

        {/* Next/Prev Navigation (Simplified) */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex justify-between">
            {/* Logic for prev/next could be inserted here. For a static demo, we keep it simple. */}
        </div>
      </article>

      {/* Right Sidebar */}
      <Toc headings={headings} />
    </div>
  );
}
