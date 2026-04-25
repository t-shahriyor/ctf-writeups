import fs from "fs";
import path from "path";

const WALKTHROUGHS_DIR = path.join(process.cwd(), "walkthroughs");
const PUBLIC_ATTACHMENTS_DIR = path.join(process.cwd(), "public", "attachments");

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFolderSync(from, to) {
  ensureDirSync(to);
  const items = fs.readdirSync(from);

  for (const item of items) {
    const fromPath = path.join(from, item);
    const toPath = path.join(to, item);
    const stat = fs.statSync(fromPath);

    if (stat.isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
      console.log(`Copied: ${fromPath} -> ${toPath}`);
    }
  }
}

function findAndCopyAttachments(dir) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      if (item === "attachments") {
        const relativeParentDir = path.relative(WALKTHROUGHS_DIR, path.dirname(itemPath));
        const outputDir = relativeParentDir
          ? path.join(PUBLIC_ATTACHMENTS_DIR, relativeParentDir)
          : PUBLIC_ATTACHMENTS_DIR;

        copyFolderSync(itemPath, outputDir);
      } else {
        findAndCopyAttachments(itemPath);
      }
    }
  }
}

function main() {
  console.log("Copying attachments to public/attachments...");

  if (fs.existsSync(PUBLIC_ATTACHMENTS_DIR)) {
    fs.rmSync(PUBLIC_ATTACHMENTS_DIR, { recursive: true, force: true });
  }

  ensureDirSync(PUBLIC_ATTACHMENTS_DIR);
  findAndCopyAttachments(WALKTHROUGHS_DIR);
  console.log("Done copying attachments.");
}

main();
