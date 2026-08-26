(() => {
  "use strict";

  // 施工事例ページのカテゴリ絞り込み。
  // カードに data-works-category、ボタンに data-works-filter を付けて対応させています。
  const filter = document.querySelector(".works-filter");
  const grid = document.querySelector("[data-works-grid]");
  if (!filter || !grid) return;

  const buttons = Array.from(filter.querySelectorAll("[data-works-filter]"));
  const cards = Array.from(grid.querySelectorAll("[data-works-category]"));
  const count = document.querySelector(".works-result-count");

  const apply = (key) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = key === "all" || card.dataset.worksCategory === key;
      card.hidden = !match;
      if (match) shown += 1;
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.worksFilter === key)));
    if (count) count.textContent = `${cards.length}件中 ${shown}件を表示`;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => apply(button.dataset.worksFilter));
  });

  apply("all");
})();
