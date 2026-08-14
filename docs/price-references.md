# 価格情報の参照一覧

価格を変更・追記する際は、先にこの一覧を確認し、同じ金額を表す掲載箇所をすべて更新する。
更新後は次を実施する。

- [ ] `rg -n --glob '*.html' '(80万〜120万円|35万〜60万円|100万〜160万円|110〜130万円|120〜150万円|130〜150万円)' .` で残存箇所を確認する
- [ ] 料金目安では、足場代の扱いを3項目とも同じ表記にする
- [ ] 施工事例本文・一覧・関連カード・メタディスクリプションの金額を照合する
- [ ] 施工事例の金額に税込表記が必要な箇所を確認する
- [ ] `price/` の施工事例直前の注記を、掲載内容と照合する

## 料金目安（正本: `price/index.html`）

| 内容 | 現在の表記 | 記載ファイル・行 | 備考 |
| --- | --- | --- | --- |
| 外壁塗装 | 80万〜120万円 | `price/index.html:61` / `services/exterior-painting/index.html:133` / `faq/index.html:54` | 足場代を含む |
| 屋根塗装 | 35万〜60万円 | `price/index.html:62` / `services/roof-painting/index.html:127` / `faq/index.html:55` | 足場代を含む |
| 外壁＋屋根 | 100万〜160万円 | `price/index.html:63` | 足場代を含む |

## 施工事例の金額

| 施工事例 | 金額 | 主な記載ファイル・行 |
| --- | --- | --- |
| 桶川市坂田 K様邸 | 110〜130万円 | `price/index.html:85` / `works/index.html:74` / `area/okegawa/index.html:73` / `works/okegawa-sakata-black/index.html:7,99` |
| 桶川市鴨川 F様邸 | 120〜150万円 | `price/index.html:86` / `works/index.html:85` / `area/okegawa/index.html:78` / `works/okegawa-kamogawa-bluegray/index.html:7,97` |
| 桶川市川田谷 K様邸 | 130〜150万円 | `price/index.html:87` / `works/index.html:96` / `area/okegawa/index.html:83` / `works/okegawa-kawatagaya-clear/index.html:7,97` |

## 関連カード

施工事例詳細ページの「他の施工事例」カードにも金額がある。変更時は3ページを相互に確認する。

| 表示先 | 金額の記載行 |
| --- | --- |
| `works/okegawa-sakata-black/index.html` | 176, 181 |
| `works/okegawa-kamogawa-bluegray/index.html` | 181, 186 |
| `works/okegawa-kawatagaya-clear/index.html` | 174, 179 |
