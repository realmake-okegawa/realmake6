import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skip = new Set([".git", "node_modules", "assets", "index_files", "scripts", "docs", "_includes", "_layouts"]);
const exclude = new Set(["takeoff.html", "google324b4de955c06238.html", "blog/chalking/index.html", "blog/caulking-deterioration/index.html", "blog/wall-crack/index.html"]);
function files(dir, result = []) { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { if (skip.has(item.name)) continue; const file = path.join(dir, item.name); item.isDirectory() ? files(file, result) : item.name.endsWith(".html") && result.push(file); } return result; }
function present(text, expression) { return expression.test(text) ? "あり" : "なし"; }
const rows = files(root).map((file) => path.relative(root, file).split(path.sep).join("/")).filter((file) => !exclude.has(file)).sort().map((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return `| ${file} | ${present(html, /<link[^>]+rel=["']canonical["']/i)} | ${present(html, /<meta[^>]+property=["']og:title["']/i)} | ${present(html, /<meta[^>]+property=["']og:image["']/i)} |`;
});
fs.writeFileSync(path.join(root, "docs", "meta-tag-audit.md"), `# 公開ページのメタタグ監査\n\n| ページ | canonical | og:title | og:image |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n`);
const descriptions = [...fs.readdirSync(path.join(root, "blog"), { withFileTypes: true })].filter((item) => item.isDirectory() && /^20/.test(item.name)).sort((a, b) => a.name.localeCompare(b.name)).map((item) => {
  const html = fs.readFileSync(path.join(root, "blog", item.name, "index.html"), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]*)">/i)?.[1] || "";
  return `| ${item.name} | ${title} | ${description} |`;
});
fs.writeFileSync(path.join(root, "docs", "blog-meta-descriptions.md"), `# ブログ meta description 一覧\n\n全件、絵文字・改行を除去し120文字以内に自動生成しています。\n\n| slug | タイトル | meta description |\n| --- | --- | --- |\n${descriptions.join("\n")}\n`);
console.log(`Wrote ${rows.length} meta rows and ${descriptions.length} blog descriptions.`);
