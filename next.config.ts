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

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath,
};

export default nextConfig;
