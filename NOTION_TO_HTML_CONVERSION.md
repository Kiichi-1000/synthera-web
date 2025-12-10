# NotionからHTMLへの変換処理

## 概要

Notionデータベースから取得した記事を、完全なHTML記事として変換し、サイトに直接表示できるようにする処理です。

## 変換フロー

1. **Notionデータベースから記事を取得**
   - ページのプロパティ（タイトル、日付、カテゴリなど）を取得
   - ページ本文（ブロック）を再帰的に取得

2. **ブロックをHTMLに変換**
   - `blocks_to_html()` 関数で各ブロックタイプを適切なHTMLタグに変換
   - リッチテキスト（太字、斜体、リンクなど）も適切に変換

3. **HTMLコンテンツの最適化**
   - `optimize_article_content()` 関数でHTMLを最適化
   - 不要な要素の削除、構造の整理

4. **JSONファイルに保存**
   - HTMLコンテンツを含む記事データをJSONファイルに保存
   - `data/affiling_articles.json` に保存

5. **フロントエンドで表示**
   - JSONファイルから記事データを読み込み
   - `bodyEl.innerHTML = article.content;` でHTMLとして直接書き込み

## 対応しているブロックタイプ

### 基本ブロック
- **paragraph** → `<p>...</p>`
- **heading_1** → `<h1>...</h1>`
- **heading_2** → `<h2>...</h2>`
- **heading_3** → `<h3>...</h3>`
- **divider** → `<hr>`

### リスト
- **bulleted_list_item** → `<ul><li>...</li></ul>`（連続する項目を1つのリストにまとめる）
- **numbered_list_item** → `<ol><li>...</li></ol>`（連続する項目を1つのリストにまとめる）
- **to_do** → `<p><input type='checkbox' ...> ...</p>`

### メディア
- **image** → `<img src="..." alt="...">`
- **code** → `<pre><code>...</code></pre>`（HTML/XMLコードはそのまま出力、その他はエスケープ）

### その他
- **callout** → `<div class='callout'><p>...</p></div>`
- **quote** → `<blockquote><p>...</p></blockquote>`
- **toggle** → `<details><summary>...</summary>...</details>`
- **table** → `<table><tbody><tr><td>...</td></tr></tbody></table>`
- **column_list** → `<div class='columns'><div class='column'>...</div></div>`
- **bookmark** → `<p><a href="..." target="_blank">...</a></p>`
- **link_preview / embed** → `<p><a href="..." target="_blank">...</a></p>`
- **table_of_contents** → スキップ（フロントエンドで自動生成）

## リッチテキストの変換

`rich_text_to_html()` 関数で以下のスタイルを変換：

- **太字** → `<strong>...</strong>`
- **斜体** → `<em>...</em>`
- **コード** → `<code>...</code>`
- **下線** → `<u>...</u>`
- **取り消し線** → `<s>...</s>`
- **リンク** → `<a href="..." target="_blank" rel="nofollow noopener">...</a>`

## HTML最適化処理

`optimize_article_content()` 関数で以下の最適化を実施：

1. **バナーコードの追加**
   - UlikeAirのランキング部分にバナーコードを自動追加

2. **不要な要素の削除**
   - 1x1ピクセルのトラッキング画像を削除
   - `0.gif` というファイル名のトラッキング画像を削除

3. **HTML構造の整理**
   - 重複する`<hr>`タグを1つにまとめる
   - 連続する空行を1つにまとめる
   - `<p>`タグ内の不要な空白を削除

4. **画像の最適化**
   - 画像に`loading="lazy"`属性を追加（既にない場合）

## 実装の詳細

### ブロックの取得
- `fetch_page_blocks()` 関数でページのブロックを再帰的に取得
- ページングを考慮して全てのブロックを取得

### ブロックの変換
- `blocks_to_html()` 関数で各ブロックタイプを適切なHTMLに変換
- 子ブロックも再帰的に処理

### 記事の同期
- `pull_from_notion()` 関数でNotionから記事を取得
- ページ本文（ブロック）からHTMLコンテンツを生成
- JSONファイルに保存

### フロントエンドでの表示
- `js/affiling.js` の `loadArticleDetail()` 関数で記事を読み込み
- `bodyEl.innerHTML = article.content;` でHTMLとして直接書き込み
- 追加処理（目次生成、見出しアンカーなど）を実行

## 使用方法

1. 記事同期を実行：
   ```bash
   python3 scripts/sync_affiling_articles.py pull --output data/affiling_articles.json
   ```

2. フロントエンドで記事を表示：
   - `affiling-article.html?id=<記事ID>` にアクセス
   - 記事内容がHTMLとして表示される

## 注意事項

- HTMLコードブロックの場合は、そのまま出力されるため、XSS対策は別途必要
- 画像URLは一時的な場合があるため、Cloudflare Imagesへのアップロードを推奨
- テーブルやカラムレイアウトは、CSSで適切にスタイリングする必要がある

