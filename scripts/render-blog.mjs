import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsPath = path.join(root, "blog-posts.json");
const indexPath = path.join(root, "index.html");

const posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
const indexHtml = fs.readFileSync(indexPath, "utf8");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayDate(date) {
  const [year, month, day] = String(date).split("-");
  if (!year || !month || !day) return escapeHtml(date);
  return `${year}.${month}.${day}`;
}

function renderBody(body) {
  const paragraphs = Array.isArray(body) ? body : String(body || "").split(/\n{2,}/);
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("\n");
}

function normalizeImages(post) {
  const normalize = (image) => {
    if (typeof image === "string") return { src: image, alt: post.title || "ブログ写真" };
    return image;
  };
  const keepExisting = (image) => {
    if (!image?.src) return false;
    if (/^(https?:)?\/\//.test(image.src)) return true;
    return fs.existsSync(path.join(root, image.src));
  };

  if (Array.isArray(post.images) && post.images.length) {
    return post.images.map(normalize).filter(keepExisting);
  }
  if (post.image) {
    return [{ src: post.image, alt: post.imageAlt || post.title || "ブログ写真" }].filter(keepExisting);
  }
  return [];
}

function bodyParagraphs(body) {
  const paragraphs = Array.isArray(body) ? body : String(body || "").split(/\n{2,}/);
  return paragraphs.map((paragraph) => String(paragraph).trim()).filter(Boolean);
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

function renderTextWithReadMore(post, baseIndent) {
  const paragraphs = bodyParagraphs(post.body);
  const text = paragraphs.join("\n\n");
  const limit = 180;
  if (text.length <= limit) return indent(renderBody(post.body), baseIndent);

  const visible = [];
  let remaining = [];
  let visibleLength = 0;

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    const separatorLength = visible.length ? 2 : 0;

    if (visibleLength + separatorLength + paragraph.length <= limit) {
      visible.push(paragraph);
      visibleLength += separatorLength + paragraph.length;
      continue;
    }

    if (!visible.length) {
      const beforeLimit = paragraph.slice(0, limit);
      const punctuation = [...beforeLimit.matchAll(/[。！？!?]/g)].at(-1);
      const splitAt = punctuation ? punctuation.index + 1 : limit;
      visible.push(`${paragraph.slice(0, splitAt).trim()}...`);
      remaining = [paragraph.slice(splitAt).trim(), ...paragraphs.slice(index + 1)].filter(Boolean);
    } else {
      visible[visible.length - 1] = `${visible[visible.length - 1]}...`;
      remaining = paragraphs.slice(index);
    }
    break;
  }

  const details = `${renderBody(visible)}
<details class="blog-more">
  <summary>続きを読む</summary>
${indent(renderBody(remaining), 2)}
</details>`;
  return indent(details, baseIndent);
}

function renderGallery(images, baseIndent) {
  if (images.length <= 1) return "";
  const items = images
    .slice(1)
    .map((image) => {
      const src = escapeHtml(image.src);
      const alt = escapeHtml(image.alt || "ブログ写真");
      return `<a href="${src}" target="_blank" rel="noopener" aria-label="${alt}を大きく表示"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></a>`;
    })
    .join("\n");
  return `\n${indent(`<div class="blog-gallery">\n${indent(items, 2)}\n</div>`, baseIndent)}`;
}

function renderCard(post, { featured = false, baseIndent = 10 } = {}) {
  const images = normalizeImages(post);
  const image = images[0]
    ? `\n${indent(`<img src="${escapeHtml(images[0].src)}" alt="${escapeHtml(images[0].alt || post.title || "ブログ写真")}" loading="lazy" decoding="async">`, 2)}`
    : "";
  const article = `<article class="blog-card${featured ? " blog-card-featured" : ""}">${image}
  <div class="blog-body">
    <div class="blog-meta"><time datetime="${escapeHtml(post.date)}">${displayDate(post.date)}</time><span>${escapeHtml(post.category || "おしらせ")}</span></div>
    <h3>${escapeHtml(post.title)}</h3>
${renderTextWithReadMore(post, 4)}${renderGallery(images, 4)}
  </div>
</article>`;
  return indent(article, baseIndent);
}

function renderArchiveItem(post) {
  return `              <details class="blog-archive-item">
                <summary>
                  <span class="blog-archive-meta"><time datetime="${escapeHtml(post.date)}">${displayDate(post.date)}</time><span>${escapeHtml(post.category || "おしらせ")}</span></span>
                  <strong>${escapeHtml(post.title)}</strong>
                </summary>
${renderCard(post, { baseIndent: 16 })}
              </details>`;
}

function renderArchive(items) {
  if (items.length <= 3) return "";
  return `
          <details class="blog-archive">
            <summary>ブログ記事をもっと見る</summary>
            <div class="blog-archive-list">
${items.map(renderArchiveItem).join("\n")}
            </div>
          </details>`;
}

function renderPosts(items) {
  if (!items.length) {
    return `          <div class="blog-empty">
            <strong>記事は準備中です。</strong>
            <span>Googleビジネスプロフィールの最新情報を、こちらにも掲載していきます。</span>
          </div>`;
  }

  const sortedItems = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const visibleItems = sortedItems.slice(0, 3);
  const archiveItems = sortedItems.slice(3);

  return visibleItems
    .map((post, index) => renderCard(post, { featured: index === 0, baseIndent: 10 }))
    .join("\n") + renderArchive(archiveItems);
}

const rendered = renderPosts(posts);
const nextHtml = indexHtml.replace(
  /          <!-- BLOG-POSTS START -->[\s\S]*?          <!-- BLOG-POSTS END -->/,
  `          <!-- BLOG-POSTS START -->\n${rendered}\n          <!-- BLOG-POSTS END -->`
);

if (nextHtml === indexHtml && !indexHtml.includes("BLOG-POSTS START")) {
  throw new Error("BLOG-POSTS markers were not found in index.html");
}

fs.writeFileSync(indexPath, nextHtml);
console.log(`Rendered ${posts.length} blog post${posts.length === 1 ? "" : "s"}.`);
