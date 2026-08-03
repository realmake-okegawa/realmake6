import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const postsPath = path.join(root, "blog-posts.json");
const localOnlyUrlPattern = /(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::\d+)?|file:\/\//i;

function findHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(entryPath, files);
    } else if (/\.html?$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

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
const localOnlyUrls = findHtmlFiles(root)
  .filter((filePath) => localOnlyUrlPattern.test(fs.readFileSync(filePath, "utf8")))
  .map((filePath) => path.relative(root, filePath));

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

if (!missingHtmlRefs.length && !missingPostImages.length && !localOnlyUrls.length) {
  console.log("OK: index.html and blog image references are present. No public HTML file contains a local-only URL.");
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

if (localOnlyUrls.length) {
  console.log("Local-only URLs found in public HTML:");
  for (const filePath of localOnlyUrls) console.log(`- ${filePath}`);
}

process.exit(missingHtmlRefs.length || localOnlyUrls.length ? 1 : 0);
