import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://realmake-okegawa.github.io/realmake6";
const defaultImage = `${siteUrl}/assets/og/default.webp`;
const ignored = new Set([".git", "node_modules", "assets", "index_files", "scripts", "docs", "blog", "_includes", "_layouts"]);
const excluded = new Set(["google324b4de955c06238.html", "takeoff.html"]);

function collect(directory, files = []) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) collect(file, files);
    else if (item.name.endsWith(".html")) files.push(file);
  }
  return files;
}

function canonicalFor(relative) {
  if (relative === "index.html") return `${siteUrl}/`;
  return relative.endsWith("/index.html") ? `${siteUrl}/${relative.slice(0, -"index.html".length)}` : `${siteUrl}/${relative}`;
}

function value(html, regex, fallback) {
  return html.match(regex)?.[1]?.trim() || fallback;
}

function addMeta(html, property, content, attribute = "property") {
  const test = new RegExp(`<meta[^>]+${attribute}=["']${property}["']`, "i");
  return test.test(html) ? html : html.replace("</head>", `  <meta ${attribute}="${property}" content="${content}">\n</head>`);
}

let updated = 0;
for (const file of collect(root)) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (excluded.has(relative)) continue;
  let html = fs.readFileSync(file, "utf8");
  const title = value(html, /<title>([^<]+)<\/title>/i, "Real Make");
  const description = value(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, "桶川市の外壁・屋根塗装ならReal Makeへご相談ください。");
  const canonical = value(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i, canonicalFor(relative));
  if (!/<link\s+rel=["']canonical["']/i.test(html)) html = html.replace("</head>", `  <link rel="canonical" href="${canonical}">\n</head>`);
  html = addMeta(html, "og:title", title);
  html = addMeta(html, "og:description", description);
  html = addMeta(html, "og:image", defaultImage);
  html = addMeta(html, "og:url", canonical);
  html = addMeta(html, "og:type", "website");
  html = addMeta(html, "twitter:card", "summary_large_image", "name");
  fs.writeFileSync(file, html);
  updated += 1;
}
console.log(`Updated social metadata for ${updated} static pages.`);
