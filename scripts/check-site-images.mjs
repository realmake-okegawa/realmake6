import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "index_files", "_includes", "_layouts"]);

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const itemPath = path.join(directory, entry.name);
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) files.push(...await collectHtml(itemPath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(itemPath);
  }
  return files;
}

function localImagePath(rawUrl, sourceRelative) {
  if (!rawUrl || rawUrl.includes("${") || /^(?:data:|mailto:|tel:|javascript:)/i.test(rawUrl)) return null;
  const decodedUrl = rawUrl.replaceAll("&#39;", "'").replaceAll("&quot;", '"');
  if (!/\.(?:jpe?g|png|webp)(?:[?#]|$)/i.test(decodedUrl)) return null;
  const sourceUrl = new URL(sourceRelative.replaceAll(path.sep, "/"), "https://local/");
  const targetUrl = new URL(decodedUrl, sourceUrl);
  if (targetUrl.origin !== "https://local" && targetUrl.hostname !== "realmake-okegawa.github.io") return null;
  return decodeURIComponent(targetUrl.pathname).replace(/^\/realmake6\//, "").replace(/^\//, "");
}

function imageUrls(html) {
  const urls = [
    ...html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi),
    ...html.matchAll(/<link\b[^>]*\bas\s*=\s*["']image["'][^>]*\bhref\s*=\s*["']([^"']+)["']/gi),
    ...html.matchAll(/url\((?:["']?)([^"')]+)(?:["']?)\)/gi),
  ].map((match) => match[1]);
  return [...new Set(urls)];
}

const failures = [];
let checked = 0;
for (const sourceFile of await collectHtml(root)) {
  const sourceRelative = path.relative(root, sourceFile);
  const html = await readFile(sourceFile, "utf8");
  for (const rawUrl of imageUrls(html)) {
    const target = localImagePath(rawUrl, sourceRelative);
    if (!target) continue;
    checked += 1;
    try {
      await access(path.join(root, target));
    } catch {
      failures.push(sourceRelative + ": " + rawUrl + " (" + target + " が見つかりません)");
    }
  }
}

if (failures.length) {
  console.error("画像参照 " + checked + " 本を確認し、" + failures.length + " 件の不整合がありました。");
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("画像参照 " + checked + " 本を確認し、すべて有効です。");
}
