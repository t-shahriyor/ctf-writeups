import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { slugify } from './utils'; // we'll create this

const WALKTHROUGHS_DIR = path.join(process.cwd(), 'walkthroughs');

export interface WalkthroughMeta {
  title: string;
  category: string;
  ctf: string;
  points?: number;
  author?: string;
  flag?: string;
  slug: string;
  filePath: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface WalkthroughData extends WalkthroughMeta {
  content: string;
}

export interface CategoryData {
  name: string;
  walkthroughs: WalkthroughMeta[];
}

export interface CTFData {
  name: string;
  categories: Record<string, CategoryData>;
}

// Ensure dir exists
if (!fs.existsSync(WALKTHROUGHS_DIR)) {
  fs.mkdirSync(WALKTHROUGHS_DIR, { recursive: true });
}

export function getAllWalkthroughs(): WalkthroughMeta[] {
  const walkthroughs: WalkthroughMeta[] = [];

  if (!fs.existsSync(WALKTHROUGHS_DIR)) {
    return walkthroughs;
  }

  const ctfs = fs.readdirSync(WALKTHROUGHS_DIR).filter(f => fs.statSync(path.join(WALKTHROUGHS_DIR, f)).isDirectory());

  for (const ctf of ctfs) {
    const ctfPath = path.join(WALKTHROUGHS_DIR, ctf);
    const categories = fs.readdirSync(ctfPath).filter(f => fs.statSync(path.join(ctfPath, f)).isDirectory());

    for (const category of categories) {
      if (category === 'attachments') continue; // skip global attachments
      
      const categoryPath = path.join(ctfPath, category);
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        const fileNameWithoutExt = file.replace(/\.md$/, '');
        
        walkthroughs.push({
          title: data.title || fileNameWithoutExt,
          category: data.category || category,
          ctf: data.ctf || ctf,
          points: data.points,
          author: data.author,
          flag: data.flag,
          slug: slugify(data.title || fileNameWithoutExt),
          filePath,
        });
      }
    }
  }

  return walkthroughs;
}

export function getSidebarData(): Record<string, CTFData> {
  const all = getAllWalkthroughs();
  const sidebar: Record<string, CTFData> = {};

  all.forEach((w) => {
    if (!sidebar[w.ctf]) {
      sidebar[w.ctf] = { name: w.ctf, categories: {} };
    }
    if (!sidebar[w.ctf].categories[w.category]) {
      sidebar[w.ctf].categories[w.category] = { name: w.category, walkthroughs: [] };
    }
    sidebar[w.ctf].categories[w.category].walkthroughs.push(w);
  });

  return sidebar;
}

// Convert Obsidian syntax & fix local normal paths
export function fixImagePaths(content: string) {
  // 1. ![[image.png]] or ![[attachments/image.png]]
  let fixed = content.replace(/!\[\[(?:.*?\/)?(.*?)\]\]/g, '![image](/attachments/$1)');
  
  // 2. ![alt](../attachments/image.png) or ![alt](attachments/image.png)
  fixed = fixed.replace(/!\[(.*?)\]\((?:.*?\/)?attachments\/(.*?)\)/g, '![$1](/attachments/$2)');
  
  return fixed;
}

export function getWalkthroughBySlug(ctfSlug: string, categorySlug: string, walkSlug: string): WalkthroughData | null {
  const all = getAllWalkthroughs();
  
  const found = all.find(w => 
    slugify(w.ctf) === ctfSlug && 
    slugify(w.category) === categorySlug && 
    w.slug === walkSlug
  );

  if (!found) return null;

  const fileContents = fs.readFileSync(found.filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    ...found,
    content: fixImagePaths(content),
  };
}

export function extractHeadings(content: string): TOCItem[] {
  const headings: TOCItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2].trim())
    });
  }
  return headings;
}
