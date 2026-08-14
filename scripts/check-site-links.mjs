import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "index_files", "_includes", "_layouts"]);

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await collectHtml(path.join(directory, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function localPath(rawHref, sourceRelative) {
  if (!rawHref || rawHref.includes("{{") || rawHref.includes("{%") || rawHref.startsWith("#") || /^(?:mailto:|tel:|javascript:|data:)/i.test(rawHref)) return null;
  const sourceUrl = new URL(sourceRelative.replaceAll(path.sep, "/"), "https://local/");
  const targetUrl = new URL(rawHref, sourceUrl);
  if (targetUrl.origin !== "https://local" && targetUrl.hostname !== "realmake-okegawa.github.io") return null;

  let pathname = decodeURIComponent(targetUrl.pathname).replace(/^\//, "");
  pathname = pathname.replace(/^realmake6\//, "");
  if (!pathname || pathname.endsWith("/")) pathname += "index.html";
  return { pathname, hash: targetUrl.hash.slice(1) };
}

const pages = await collectHtml(root);
const failures = [];
let checked = 0;

for (const sourceFile of pages) {
  const sourceRelative = path.relative(root, sourceFile);
  const source = await readFile(sourceFile, "utf8");
  const hrefs = [...source.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);

  for (const href of hrefs) {
    const target = localPath(href, sourceRelative);
    if (!target) continue;
    checked += 1;
    const targetFile = path.join(root, target.pathname);
    try {
      await access(targetFile);
      if (target.hash) {
        const targetHtml = await readFile(targetFile, "utf8");
        const escaped = target.hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!new RegExp(`\\b(?:id|name)=["']${escaped}["']`, "i").test(targetHtml)) {
          failures.push(`${sourceRelative}: ${href} (アンカーが見つかりません)`);
        }
      }
    } catch {
      failures.push(`${sourceRelative}: ${href} (${target.pathname} が見つかりません)`);
    }
  }
}

if (failures.length) {
  console.error(`内部リンク ${checked} 本を確認し、${failures.length} 件の不整合がありました。`);
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`内部リンク ${checked} 本を確認し、すべて有効です。`);
}
