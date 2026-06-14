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
    .join("\n              ");
}

function normalizeImages(post) {
  if (Array.isArray(post.images) && post.images.length) {
    return post.images.map((image) => {
      if (typeof image === "string") return { src: image, alt: post.title || "ブログ写真" };
      return image;
    });
  }
  if (post.image) {
    return [{ src: post.image, alt: post.imageAlt || post.title || "ブログ写真" }];
  }
  return [];
}

function postText(body) {
  return (Array.isArray(body) ? body.join("\n\n") : String(body || "")).trim();
}

function renderTextWithReadMore(post) {
  const text = postText(post.body);
  const limit = 180;
  if (text.length <= limit) return renderBody(post.body);

  const excerpt = `${text.slice(0, limit).trim()}...`;
  return `<p>${escapeHtml(excerpt).replaceAll("\n", "<br>")}</p>
              <details class="blog-more">
                <summary>続きを読む</summary>
                ${renderBody(post.body)}
              </details>`;
}

function renderGallery(images) {
  if (images.length <= 1) return "";
  return `
              <div class="blog-gallery">
                ${images
                  .slice(1)
                  .map((image) => {
                    const src = escapeHtml(image.src);
                    const alt = escapeHtml(image.alt || "ブログ写真");
                    return `<a href="${src}" target="_blank" rel="noopener" aria-label="${alt}を大きく表示"><img src="${src}" alt="${alt}"></a>`;
                  })
                  .join("\n                ")}
              </div>`;
}

function renderArchiveGallery(images) {
  if (!images.length) return "";
  return `
                    <div class="blog-gallery">
                      ${images
                        .map((image) => {
                          const src = escapeHtml(image.src);
                          const alt = escapeHtml(image.alt || "ブログ写真");
                          return `<a href="${src}" target="_blank" rel="noopener" aria-label="${alt}を大きく表示"><img src="${src}" alt="${alt}"></a>`;
                        })
                        .join("\n                      ")}
                    </div>`;
}

function renderArchiveItem(post) {
  const images = normalizeImages(post);
  return `              <article class="blog-archive-item">
                <details>
                  <summary>
                    <span>${displayDate(post.date)}　${escapeHtml(post.category || "おしらせ")}</span>
                    <strong>${escapeHtml(post.title)}</strong>
                  </summary>
                  <div class="blog-archive-body">
                    ${renderBody(post.body)}${renderArchiveGallery(images)}
                  </div>
                </details>
              </article>`;
}

function renderArchive(items) {
  if (items.length <= 3) return "";
  return `
          <details class="blog-archive">
            <summary>ブログ記事一覧を見る</summary>
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

  return visibleItems
    .map((post, index) => {
      const featuredClass = index === 0 ? " blog-card-featured" : "";
      const images = normalizeImages(post);
      const image = images[0]
        ? `            <img src="${escapeHtml(images[0].src)}" alt="${escapeHtml(images[0].alt || post.title || "ブログ写真")}">\n`
        : "";
      return `          <article class="blog-card${featuredClass}">
${image}            <div class="blog-body">
              <div class="blog-meta"><time datetime="${escapeHtml(post.date)}">${displayDate(post.date)}</time><span>${escapeHtml(post.category || "おしらせ")}</span></div>
              <h3>${escapeHtml(post.title)}</h3>
              ${renderTextWithReadMore(post)}${renderGallery(images)}
            </div>
          </article>`;
    })
    .join("\n") + renderArchive(sortedItems);
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
