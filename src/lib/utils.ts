import GithubSlugger from 'github-slugger';

export function slugify(text: string): string {
  const slugger = new GithubSlugger();
  return slugger.slug(text);
}
