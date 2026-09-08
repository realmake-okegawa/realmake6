# 概算費用チェックの計測

2026年9月5日追加。GA4に既存のクリックイベントと以下のイベントを送信します。

| イベント | 記録するタイミング |
| --- | --- |
| `simulator_click` | サイト内の概算費用チェックへのリンクを押したとき（既存） |
| `simulator_start` | シミュレーターで入力を変更、または「次へ」を押したとき。やり直しまで1回 |
| `simulator_result_view` | 計算結果の画面が表示されたとき。表示中の重複送信なし |
| `simulator_result_copy` | 結果画面で、LINEに送る相談文をコピーできたとき |
| `simulator_contact_click` | 結果画面の写真・図面相談・電話・LINE・フォームへのリンクを押したとき |
| `simulator_restart` | 結果画面で「最初からやり直す」を押したとき |

`simulator_contact_click` の `contact_method` は `photo`・`phone`・`line`・`form`。写真・図面相談は実際の送信ではなく、より具体的な相談ページへ進む意思表示として記録します。
共通クリックイベントには `link_location` を追加し、ヘッダー、固定バー、トップの費用相談欄などの入口を区別します。
入力内容、写真、氏名、住所、算出金額は今回のイベントには送りません。

## GA4で確認すること

1. リアルタイムまたはDebugViewで、開始→結果表示→写真・図面相談またはLINE相談の順にイベントが届くか確認する。
2. データが蓄積したら、探索のファネルで `simulator_start` → `simulator_result_view` → `simulator_contact_click` を順に比較する。`contact_method` で、写真・図面相談とLINE・電話・フォームを分けて確認する。
3. `link_location` で比較する場合は、GA4管理画面で同名パラメータをイベントスコープのカスタムディメンションとして登録する。サイト実装のみでは管理画面の登録は行われない。
4. 集計期間・対象ユーザー・端末を揃える。単純なイベント回数の割り算では、やり直しや複数クリックが含まれる。

**電話やLINEのクリックは、通話成立・メッセージ送信・受注を意味しません。**
実際に受けた問い合わせ件数や相談経路と照らし合わせて評価します。
広告ブロックや通信状態などにより、すべての利用を記録できるとは限りません。

## カラーシミュレーターの計測

2026年9月8日追加。写真・画像データ・ファイル名はGA4へ送信しません。

| イベント | 記録するタイミング |
| --- | --- |
| `color_photo_loaded` | サンプルまたは自宅写真を読み込めたとき |
| `color_photo_error` | 写真を読み込めなかったとき |
| `color_area_selected` | タップで色を変える範囲を追加できたとき |
| `color_change` | 色を選んだとき |
| `color_save_click` | 画像保存を押したとき |
| `color_image_export` | ダウンロード開始、共有完了、または保存用画像表示時 |
| `color_save_error` | 画像保存に失敗したとき |
| `color_share_cancel` | 端末の共有をキャンセルしたとき |
| `color_line_click` | LINE相談へのリンクを押したとき |
| `color_adjustment_toggle` | 詳細調整を開閉したとき |

`color_photo_loaded` には `source`（`sample` または `own_photo`）、`color_change` には `color_name`、`color_image_export` には `method` を付けます。`color_line_click` は `placement` で、案内文・調整欄の相談カード・保存後の相談カードを区別します。

写真読込、色変更、保存、LINE相談の順に進んでいるかをGA4の探索で確認します。保存操作やLINEクリックは、写真保存完了や問い合わせ送信の完了を意味しません。実際に受けた相談件数と照らし合わせて判断します。

## 表示への影響

計測は `assets/js/simulator-analytics.js` に分離しています。費用の計算式や入力値、リンク先は変更しません。
GAが読み込めない場合も、入力・計算・結果表示は継続します。
