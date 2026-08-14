(() => {
  "use strict";
  const cards = [...document.querySelectorAll(".blog-index-card")];
  const filters = [...document.querySelectorAll("[data-blog-filter]")];
  const previous = document.querySelector("[data-blog-prev]");
  const next = document.querySelector("[data-blog-next]");
  const pageLabel = document.querySelector("[data-blog-page]");
  const result = document.querySelector(".blog-result-count");
  const pageSize = 12;
  let filter = "all";
  let page = 1;
  if (!cards.length || !previous || !next || !pageLabel || !result) return;
  document.documentElement.classList.add("blog-index-ready");
  const update = () => {
    const matched = cards.filter((card) => filter === "all" || card.dataset.blogCategory === filter);
    const pages = Math.max(1, Math.ceil(matched.length / pageSize));
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize;
    cards.forEach((card) => { card.hidden = !matched.includes(card) || matched.indexOf(card) < start || matched.indexOf(card) >= start + pageSize; });
    result.textContent = `${matched.length}件中 ${start + 1}〜${Math.min(start + pageSize, matched.length)}件を表示`;
    pageLabel.textContent = `${page} / ${pages}`;
    previous.disabled = page === 1;
    next.disabled = page === pages;
  };
  filters.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.blogFilter || "all";
    page = 1;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    update();
  }));
  previous.addEventListener("click", () => { page -= 1; update(); });
  next.addEventListener("click", () => { page += 1; update(); });
  update();
})();
