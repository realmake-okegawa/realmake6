import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderHeader } from "./navigation-template.mjs";

const pages = [
  { file: "index.html", root: "./", current: "home" },
  { file: "area/index.html", root: "../", current: "area" },
  { file: "area/okegawa/index.html", root: "../../", current: "area" },
  { file: "company/index.html", root: "../", current: "company" },
  { file: "faq/index.html", root: "../", current: "faq" },
  { file: "flow/index.html", root: "../", current: "contact" },
  { file: "gallery/index.html", root: "../", current: "works" },
  { file: "painting_simulator.html", root: "./", current: "price" },
  { file: "price/index.html", root: "../", current: "price" },
  { file: "reason/index.html", root: "../", current: "reason" },
  { file: "reviews/index.html", root: "../", current: "reason" },
  { file: "services/exterior-painting/index.html", root: "../../", current: "exterior" },
  { file: "services/roof-painting/index.html", root: "../../", current: "roof" },
  { file: "support/index.html", root: "../", current: "reason" },
  { file: "works/index.html", root: "../", current: "works" },
  { file: "works/okegawa-kamogawa-bluegray/index.html", root: "../../", current: "works" },
  { file: "works/okegawa-kawatagaya-clear/index.html", root: "../../", current: "works" },
  { file: "works/okegawa-sakata-black/index.html", root: "../../", current: "works" },
];

const headerPattern = /<header class="(?:sitehead|site-header)[^>]*>[\s\S]*?<\/header>/;

for (const page of pages) {
  const pathname = resolve(process.cwd(), page.file);
  const source = await readFile(pathname, "utf8");
  if (!headerPattern.test(source)) throw new Error(`ヘッダーが見つかりません: ${page.file}`);

  const header = renderHeader(page);
  const withHeader = source.replace(headerPattern, header);
  const script = `<script src="${page.root}assets/js/nav.js" defer></script>`;
  const next = withHeader.includes("assets/js/nav.js") ? withHeader : withHeader.replace("</head>", `${script}\n</head>`);
  await writeFile(pathname, next);
  console.log(`更新: ${page.file}`);
}
