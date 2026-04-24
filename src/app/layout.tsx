import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getSidebarData } from "@/lib/markdown";
import { ThemeProvider } from "next-themes";

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
  const sidebarData = getSidebarData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col md:flex-row bg-[var(--color-bg)] w-full text-[var(--color-text)]`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <Sidebar data={sidebarData} className="hidden md:flex w-72 flex-col fixed inset-y-0 left-0 bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] z-20" />
          
          <main className="flex-1 md:pl-72 flex flex-col min-h-screen max-w-[1400px]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
