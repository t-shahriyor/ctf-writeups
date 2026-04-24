"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const onCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.textContent || "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group mb-4">
      <button
        onClick={onCopy}
        className="absolute right-2 top-2 p-1.5 rounded-md bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-heading)] opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
        aria-label="Copy code"
        title="Copy"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre ref={preRef} {...props} className="!mb-0">
        {children}
      </pre>
    </div>
  );
}
