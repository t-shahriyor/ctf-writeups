import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CTF Walkthroughs",
  description: "Self-hosted CTF writeups",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col md:flex-row bg-[var(--color-bg)] w-full text-[var(--color-text)]`}>
        {/* Left Sidebar */}
        <Sidebar className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] z-20" />
        
        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 flex flex-col min-h-screen max-w-[1400px]">
          {children}
        </main>
      </body>
    </html>
  );
}
