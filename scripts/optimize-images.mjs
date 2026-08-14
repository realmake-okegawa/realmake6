import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsPath = path.join(root, "blog-posts.json");
const rendererPath = path.join(root, "scripts", "render-blog.mjs");
const outputRoot = path.join(root, "assets", "optimized");
const siteUrl = "https://realmake-okegawa.github.io/realmake6/";
const imageExtension = /\.(?:jpe?g|png|webp)$/i;
const ignoredDirectories = new Set([".git", "node_modules", "assets", "index_files", "images", "index,html_files", "blog"]);
const skippedNames = /(?:^|\/)(?:line-qr|logo)(?:\.|$)/i;
const stats = { created: 0, skipped: 0, sources: 0, bytesBefore: 0, bytesAfter: 0, rewrittenFiles: 0 };

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function sourceFromImage(image) {
  return image.source || image.src;
}

function outputPath(source, variant) {
  const relative = source.replace(/^assets\//, "").replace(imageExtension, ".webp");
  return variant === "page"
    ? `assets/optimized/page/${source.replace(imageExtension, ".webp")}`
    : `assets/optimized/blog/${variant}/${relative}`;
}

function isProcessable(source) {
  return imageExtension.test(source) && !source.startsWith("assets/optimized/") && !skippedNames.test(source);
}

async function createWebp(source, destination, maxSide, quality = 80) {
  const input = path.join(root, source);
  const output = path.join(root, destination);
  if (!fs.existsSync(input)) throw new Error(`Image source not found: ${source}`);
  const outputFresh = fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs;
  if (outputFresh) {
    stats.skipped += 1;
    return;
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const inputSize = fs.statSync(input).size;
  await sharp(input, { animated: false })
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(output);
  stats.created += 1;
  stats.bytesBefore += inputSize;
  stats.bytesAfter += fs.statSync(output).size;
}

function walkSourceFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkSourceFiles(filePath, files);
    else if (/\.(?:html|css|md)$/i.test(entry.name)) files.push(filePath);
  }
  return files;
}

function walkFiles(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(filePath, files);
    else files.push(filePath);
  }
  return files;
}

function sourceReferences(text) {
  return [...text.matchAll(/(?:\.\.\/|\.\/)*(?:assets|index_files)\/[A-Za-z0-9_./-]+?\.(?:jpe?g|png|webp)/gi)]
    .map((match) => match[0]);
}

function resolveReference(filePath, reference) {
  return toPosix(path.relative(root, path.resolve(path.dirname(filePath), reference)));
}

function referenceFor(filePath, destination) {
  const relative = toPosix(path.relative(path.dirname(filePath), path.join(root, destination)));
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function replaceStaticReferences(filePath, mapping) {
  let text = fs.readFileSync(filePath, "utf8");
  const original = text;
  for (const [source, destination] of mapping) {
    text = text.replaceAll(`${siteUrl}${source}`, `${siteUrl}${destination}`);
  }
  text = text.replace(/(?:\.\.\/|\.\/)*(?:assets|index_files)\/[A-Za-z0-9_./-]+?\.(?:jpe?g|png|webp)/gi, (reference) => {
    const source = resolveReference(filePath, reference);
    const destination = mapping.get(source);
    return destination ? referenceFor(filePath, destination) : reference;
  });
  text = text.replaceAll(`${siteUrl}./assets/`, `${siteUrl}assets/`);
  if (text !== original) {
    fs.writeFileSync(filePath, text);
    stats.rewrittenFiles += 1;
  }
}

const posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
const blogSources = new Set();
for (const post of posts) {
  const images = Array.isArray(post.images) ? post.images : post.image ? [{ src: post.image, alt: post.imageAlt }] : [];
  post.images = images.map((image) => typeof image === "string" ? { src: image, alt: post.title } : image);
  delete post.image;
  delete post.imageAlt;
  for (const image of post.images) {
    const source = sourceFromImage(image);
    if (!isProcessable(source)) continue;
    blogSources.add(source);
    image.source = source;
    image.src = outputPath(source, "full");
    image.thumbnail = outputPath(source, "thumb");
  }
}

for (const source of blogSources) {
  await createWebp(source, outputPath(source, "full"), 1600);
  await createWebp(source, outputPath(source, "thumb"), 800);
}
stats.sources += blogSources.size;
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n");

const mapping = new Map();
for (const source of blogSources) mapping.set(source, outputPath(source, "full"));
for (const optimizedFile of walkFiles(path.join(outputRoot, "page"))) {
  if (path.extname(optimizedFile).toLowerCase() !== ".webp") continue;
  const destination = toPosix(path.relative(root, optimizedFile));
  const sourceBase = toPosix(path.relative(path.join(outputRoot, "page"), optimizedFile)).replace(/\.webp$/i, "");
  for (const extension of [".jpg", ".jpeg", ".png", ".webp"]) {
    const source = `${sourceBase}${extension}`;
    if (fs.existsSync(path.join(root, source))) {
      mapping.set(source, destination);
      break;
    }
  }
}
for (const filePath of walkSourceFiles(root)) {
  const text = fs.readFileSync(filePath, "utf8");
  for (const reference of sourceReferences(text)) {
    const source = resolveReference(filePath, reference);
    if (!isProcessable(source) || mapping.has(source) || !fs.existsSync(path.join(root, source))) continue;
    const destination = outputPath(source, "page");
    mapping.set(source, destination);
  }
}
for (const [source, destination] of mapping) {
  if (blogSources.has(source)) continue;
  await createWebp(source, destination, 1920, 82);
  stats.sources += 1;
}
for (const filePath of walkSourceFiles(root)) replaceStaticReferences(filePath, mapping);

await import(`${pathToFileURL(rendererPath).href}?image-opt=${Date.now()}`);
console.log(JSON.stringify({
  sources: stats.sources,
  created: stats.created,
  skipped: stats.skipped,
  rewrittenFiles: stats.rewrittenFiles,
  createdMiB: Number((stats.bytesAfter / 1024 / 1024).toFixed(2)),
  sourceMiB: Number((stats.bytesBefore / 1024 / 1024).toFixed(2)),
}, null, 2));
