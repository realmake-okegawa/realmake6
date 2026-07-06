# Real Make 公式ホームページ

公開URL: https://realmake-okegawa.github.io/realmake6/

このリポジトリを Real Make（リアルメイク）の公式ホームページ本体として運用します。

## よく触るファイル

- `index.html`: トップページ本体
- `painting_simulator.html`: 概算費用シミュレーター
- `blog-posts.json`: おしらせ・現場ブログの記事データ
- `assets/blog/`: ブログ画像
- `assets/images/`, `assets/sections/`, `assets/before-after/`: サイト内の固定画像

## ブログを更新する流れ

1. `assets/blog/` に画像を追加します。
2. `blog-posts.json` に記事を追加します。
3. ブログ部分を生成します。

```bash
node scripts/render-blog.mjs
```

4. 画像やページの参照切れを確認します。

```bash
node scripts/check-site.mjs
```

## 公開前チェック

- 電話番号、LINE、Instagram、Facebookのリンクが正しいか
- 施工写真やブログ画像が表示されるか
- スマホ幅で文字やボタンがはみ出していないか
- 料金や対応エリアの表記を変更した場合、ページ上部とお問い合わせ付近で表記が揃っているか

## メモ

`scripts/render-blog.mjs` は、存在する画像だけをHTMLに出します。古い記事の画像が手元にない場合でも、公開ページ側では画像切れを出さず、本文だけ表示します。
deploy retry 4
