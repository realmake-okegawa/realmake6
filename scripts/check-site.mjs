import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const postsPath = path.join(root, "blog-posts.json");

function isLocal(value) {
  return (
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("assets/") ||
    value.endsWith(".html")
  );
}

function existsLocal(value) {
  const clean = value.replace(/^\.\/+/, "").split("#")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("tel:") || clean.startsWith("mailto:")) return true;
  return fs.existsSync(path.join(root, clean));
}

const html = fs.readFileSync(indexPath, "utf8");
const localRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter(isLocal);

const missingHtmlRefs = [...new Set(localRefs.filter((ref) => !existsLocal(ref)))];

const posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
const missingPostImages = [];

for (const post of posts) {
  for (const image of post.images || []) {
    const src = typeof image === "string" ? image : image.src;
    if (src && !existsLocal(src)) {
      missingPostImages.push(`${post.date} ${post.title}: ${src}`);
    }
  }
}

if (!missingHtmlRefs.length && !missingPostImages.length) {
  console.log("OK: index.html and blog image references are present.");
  process.exit(0);
}

if (missingHtmlRefs.length) {
  console.log("Missing references in index.html:");
  for (const ref of missingHtmlRefs) console.log(`- ${ref}`);
}

if (missingPostImages.length) {
  console.log("Warning: missing images listed in blog-posts.json. They are skipped when rendering the public page:");
  for (const ref of missingPostImages) console.log(`- ${ref}`);
}

process.exit(missingHtmlRefs.length ? 1 : 0);
