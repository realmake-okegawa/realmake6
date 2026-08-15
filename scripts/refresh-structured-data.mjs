import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://realmake-okegawa.github.io/realmake6/";
const postData = JSON.parse(fs.readFileSync(path.join(root, "blog-posts.json"), "utf8"));

const staticPages = [
  "faq/index.html",
  "works/index.html",
  "works/okegawa-sakata-black/index.html",
  "works/okegawa-kawatagaya-clear/index.html",
  "works/okegawa-kamogawa-bluegray/index.html",
  "services/exterior-painting/index.html",
  "services/roof-painting/index.html",
  "price/index.html",
  "company/index.html",
  "reviews/index.html",
  "area/index.html",
  "area/okegawa/index.html",
  "reason/index.html",
  "flow/index.html",
  "support/index.html",
  "gallery/index.html",
  "blog/index.html",
  "painting_simulator.html",
  "contact/index.html",
  "contact/thanks/index.html",
];
const pages = [...staticPages, ...postData.map((post) => `blog/${post.slug}/index.html`)];

function escapeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function htmlText(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalFor(file) {
  if (file === "index.html") return siteUrl;
  if (file.endsWith("/index.html")) return `${siteUrl}${file.slice(0, -"index.html".length)}`;
  return `${siteUrl}${file}`;
}

function canonicalize(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/index\.html$/, "/");
  return parsed.toString();
}

function breadcrumbData(html, file) {
  const crumb = html.match(/<(?:div|nav)\b[^>]*class=["'][^"']*\bcrumb\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|nav)>/i);
  if (!crumb) return null;
  const currentUrl = canonicalFor(file);
  const items = crumb[1].split("＞").map((part, index, parts) => {
    const anchor = part.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    const name = htmlText(anchor ? anchor[2] : part);
    if (!name) return null;
    const item = anchor
      ? canonicalize(new URL(anchor[1], currentUrl).toString())
      : index === parts.length - 1 ? currentUrl : undefined;
    return { "@type": "ListItem", position: index + 1, name, ...(item ? { item } : {}) };
  }).filter(Boolean);
  if (!items.length) return null;
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function upsertSchema(html, id, data) {
  const tag = `<script id="${id}" type="application/ld+json">${escapeJson(data)}</script>`;
  const pattern = new RegExp(`<script id="${id}" type="application/ld\\+json">[\\s\\S]*?<\\/script>`);
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

function faqData(html) {
  const pairs = [...html.matchAll(/<details\b[^>]*>[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<div class="ans">[\s\S]*?<div>([\s\S]*?)<\/div>[\s\S]*?<\/details>/g)]
    .map((match) => ({ name: htmlText(match[1]), text: htmlText(match[2]) }))
    .filter((entry) => entry.name && entry.text);
  if (pairs.length !== 15) throw new Error(`FAQPage must contain 15 visible Q&A pairs, found ${pairs.length}.`);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((entry) => ({
      "@type": "Question",
      name: entry.name,
      acceptedAnswer: { "@type": "Answer", text: entry.text },
    })),
  };
}

const servicePages = new Map([
  ["services/exterior-painting/index.html", {
    name: "外壁塗装",
    description: "外壁の色あせ、ひび割れ、チョーキング、コーキングの劣化を確認し、高圧洗浄・下地補修・3回塗りで行う外壁塗装サービスです。",
  }],
  ["services/roof-painting/index.html", {
    name: "屋根塗装",
    description: "屋根材と劣化状態を確認し、必要な下地処理と塗装を行う屋根塗装サービスです。",
  }],
]);

for (const file of pages) {
  const absolute = path.join(root, file);
  let html = fs.readFileSync(absolute, "utf8");
  const breadcrumb = breadcrumbData(html, file);
  if (breadcrumb && !html.includes('"@type": "BreadcrumbList"') && !html.includes('"@type":"BreadcrumbList"')) {
    html = upsertSchema(html, "breadcrumb-schema", breadcrumb);
  }
  if (file === "faq/index.html") html = upsertSchema(html, "faq-schema", faqData(html));
  if (servicePages.has(file)) {
    const service = servicePages.get(file);
    html = upsertSchema(html, "service-schema", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      provider: { "@id": `${siteUrl}#business` },
      areaServed: [
        { "@type": "City", name: "桶川市" },
        { "@type": "AdministrativeArea", name: "埼玉県" },
      ],
      description: service.description,
    });
  }
  fs.writeFileSync(absolute, html);
}

console.log(`Updated structured data for ${pages.length} pages.`);
