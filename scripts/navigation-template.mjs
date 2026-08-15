export const NAV_ITEMS = [
  { key: "exterior", label: "外壁塗装", path: "services/exterior-painting/" },
  { key: "roof", label: "屋根塗装", path: "services/roof-painting/" },
  { key: "works", label: "施工事例", path: "works/" },
  { key: "price", label: "料金", path: "price/" },
  { key: "reason", label: "選ばれる理由", path: "reason/" },
  { key: "area", label: "桶川市", path: "area/okegawa/" },
  { key: "company", label: "代表・会社情報", path: "company/" },
  { key: "faq", label: "よくある質問", path: "faq/" },
  { key: "contact", label: "お問い合わせ", path: "contact/" },
];

export function renderHeader({ root, current }) {
  const navLinks = NAV_ITEMS.map(({ key, label, path }) => {
    const ariaCurrent = key === current ? ' aria-current="page"' : "";
    return `      <a href="${root}${path}"${ariaCurrent}>${label}</a>`;
  }).join("\n");
  const logoCurrent = current === "home" ? ' aria-current="page"' : "";

  return `<header class="sitehead">
  <div class="in">
    <div class="sitehead-row">
      <a class="logo" href="${root}"${logoCurrent}><img class="sitehead-logo-mark" src="${root}assets/web/site/logo.webp" alt="" width="38" height="38"><span class="sitehead-logo-name">Real Make<span class="sitehead-logo-kana">（リアルメイク）</span></span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="menu-toggle-icon" aria-hidden="true">☰</span><span class="visually-hidden">メニューを開く</span>
      </button>
      <a class="sitehead-phone" href="tel:09014340189">電話する</a>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="主要メニュー">
${navLinks}
    </nav>
  </div>
</header>`;
}
