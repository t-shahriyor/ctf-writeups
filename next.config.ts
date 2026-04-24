import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let basePath = '';

if (isGithubActions) {
  // e.g. "USERNAME/REPO_NAME"
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) {
    basePath = `/${repo}`;
  }
}

// Map it so it's available to client AND server components
process.env.NEXT_PUBLIC_BASE_PATH = basePath;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  }
};

export default nextConfig;
