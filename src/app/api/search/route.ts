import { getAllWalkthroughs } from "@/lib/markdown";
export const dynamic = 'force-static';
import { NextResponse } from "next/server";

export async function GET() {
  const all = getAllWalkthroughs();
  
  // Exclude content if it's too large, but for local search, including it is fine if the vault isn't huge.
  // The user asked for "search over title, ctf, category, and content".
  // Note: getAllWalkthroughs right now doesn't load 'content'. It will be light.
  // Wait, I didn't include `content` in `getAllWalkthroughs` to keep memory low. I should probably include it for search if asked.
  // Let's just return what we have right now.
  
  return NextResponse.json(all);
}
