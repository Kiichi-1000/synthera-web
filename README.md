# Synthera - Creative Digital Studio

革新的なコンテンツで未来を創造するクリエイティブデジタルスタジオの公式ウェブサイトです。

## 🚀 概要

Syntheraは個人経営のクリエイティブデジタルスタジオとして、以下の4つの事業領域で活動しています：

- **YouTubeチャンネル運営**: クリエイティブな動画コンテンツの制作・配信
- **ブランド運営**: 独自のブランドアイデンティティの構築・展開
- **アプリ開発**: 革新的なアプリケーションの設計・開発
- **個人ライティング**: 価値あるコンテンツの執筆・発信

## 🎨 デザインコンセプト

- **カラーパレット**: ダークトーンをベースに、エレクトリックブルーとゴールドをアクセントカラーとして使用
- **タイポグラフィ**: Interフォントを使用したモダンで洗練されたデザイン
- **アニメーション**: スムーズなトランジションとインタラクティブな要素
- **レスポンシブ**: モバイルファーストの設計

## 📁 プロジェクト構成

```
synthera.website/
├── index.html              # ホームページ
├── about.html              # 会社概要ページ
├── projects.html           # プロジェクト一覧ページ
├── note.html               # 記事一覧ページ（Notion連携）
├── css/                    # スタイルシート
│   ├── style.css          # グローバルスタイル
│   ├── home.css           # ホームページ専用スタイル
│   ├── about.css          # アバウトページ専用スタイル
│   ├── projects.css       # プロジェクトページ専用スタイル
│   └── note.css           # ノートページ専用スタイル
├── js/                     # JavaScriptファイル
│   ├── main.js            # メイン機能
│   ├── navigation.js      # ナビゲーション機能
│   ├── animations.js      # アニメーション機能
│   ├── projects-data.js   # SNSタブ用グリッドデータ読み込み
│   └── development-data.js # アプリ開発タブ用データ読み込み
├── scripts/                # 補助スクリプト
│   ├── sync_notion_grids.py   # Notion同期ユーティリティ（push/pull）
│   ├── sync_app_development.py # アプリ開発データ同期ユーティリティ
│   └── notion_grid_admin.py   # 管理者UI用ローカルサーバー
├── data/
│   └── sns_grids.json         # NotionからエクスポートしたSNSグリッドデータ
│   └── dev_projects.json      # Notionからエクスポートしたアプリ開発データ
├── assets/                 # アセットファイル
│   ├── images/            # 画像ファイル
│   └── icons/             # アイコンファイル
├── .unity-mcp/            # MCP設定ファイル
│   └── config.json        # Notion MCP設定
├── .gitignore             # Git除外設定
└── README.md              # プロジェクト説明書
```

## 🛠️ 技術スタック

- **HTML5**: セマンティックなマークアップ
- **CSS3**: カスタムプロパティ、Flexbox、Grid、アニメーション
- **JavaScript (ES6+)**: モダンなJavaScript機能
- **Notion API**: コンテンツ管理システムとしてNotionを活用
- **MCP (Model Context Protocol)**: Notionとの連携

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/synthera.website.git
cd synthera.website
```

### 2. Notion API設定

1. [Notion Developers](https://developers.notion.com/)でインテグレーションを作成し、シークレット（トークン）を取得してください。
2. `NOTION_API_TOKEN` をシェルでエクスポートするか、`.env` などから読み込ませてください。
3. インテグレーションを対象ワークスペースに招待し、`synthera database` ページ（もしくは該当データベース）へ編集権限で共有してください。

### 3. Notion同期ユーティリティ

```bash
# 例: 環境変数を設定してから実行
export NOTION_API_TOKEN="your_notion_token"

# SNSタブ: Notion ←→ JSON
python3 scripts/sync_notion_grids.py pull         # Notion → data/sns_grids.json
python3 scripts/sync_notion_grids.py push         # 静的データ → Notion
python3 scripts/sync_notion_grids.py push --reset # 既存レコードをアーカイブしてから同期

# Noteページ: Notion ←→ JSON
python3 scripts/sync_note_articles.py pull
python3 scripts/sync_note_articles.py push
python3 scripts/sync_note_articles.py push --reset

# 個人ライティングタブ: Notion ←→ JSON
python3 scripts/sync_writing_articles.py pull
python3 scripts/sync_writing_articles.py push
python3 scripts/sync_writing_articles.py push --reset

# ECタブ: Notion ←→ JSON
python3 scripts/sync_ec_projects.py pull
python3 scripts/sync_ec_projects.py push
python3 scripts/sync_ec_projects.py push --reset

# アプリ開発タブ: Notion ←→ JSON
python3 scripts/sync_app_development.py pull
python3 scripts/sync_app_development.py push
python3 scripts/sync_app_development.py push --reset

# pull コマンドは `--output` オプションで任意パスへ出力可能
python3 scripts/sync_app_development.py pull --output tmp/dev.json
python3 scripts/sync_writing_articles.py pull --output tmp/writing.json
python3 scripts/sync_note_articles.py pull --output tmp/note.json
python3 scripts/sync_ec_projects.py pull --output tmp/ec.json
```

### 4. 管理者UI（ローカル管理ページ）

```bash
export NOTION_API_TOKEN="your_notion_token"
python3 scripts/notion_grid_admin.py
```

ブラウザで `http://127.0.0.1:8765/` を開くと、以下が利用できます。

- SNS / Note / 個人ライティング / アプリ開発 / EC の各データセット件数確認
- データセットごとに `pull`（Notion → JSON）・`push`（静的データ → Notion、リセット付き）をボタン操作
- 全データセットの `pull` / `push` を一括実行

### 5. ローカルサーバーの起動

```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx serve .

# PHPの場合
php -S localhost:8000
```

ブラウザで`http://localhost:8000`にアクセスしてサイトを確認できます。

## 📝 機能

### ホームページ
- 印象的なヒーローセクション
- 会社紹介と統計情報
- 事業領域のプレビュー
- CTAセクション

### アバウトページ
- ビジョン・ミッション
- 代表者プロフィール
- 価値観の紹介
- 会社の歩み

### プロジェクトページ
- 4つの事業領域の詳細
- タブ切り替えインターフェース
- プロジェクトカードの3Dホバー効果
- SNSタブは `data/sns_grids.json` を読み込み、Notionの内容を反映
- Noteページは `data/note_articles.json` を読み込み、Notionの内容を反映
- 個人ライティングタブは `data/writing_articles.json` を読み込み、Notionの内容を反映
- ECタブは `data/ec_projects.json` を読み込み、Notionの内容を反映
- アプリ開発タブは `data/dev_projects.json` を読み込み、Notionの内容を反映
- EC タブの画像は Notion の `Project Image` プロパティにアップロード／外部URLを指定すると反映されます。

### ノートページ
- Notionデータベースからの記事取得（`data/note_articles.json`）
- カテゴリ別フィルタリング
- 検索機能
- 無限スクロール（ページネーション）

## 🎨 カスタマイズ

### カラーパレットの変更

`css/style.css`のCSS変数を編集：

```css
:root {
  --color-primary: #00d4ff;      /* メインカラー */
  --color-secondary: #ffd700;    /* セカンダリカラー */
  --color-accent: #ff6b6b;       /* アクセントカラー */
  --color-background: #0a0a0a;   /* 背景色 */
  /* ... */
}
```

### フォントの変更

`index.html`のGoogle Fontsリンクを変更：

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## 📱 レスポンシブ対応

- **モバイル**: ~768px
- **タブレット**: 769px~1024px
- **デスクトップ**: 1025px~

## 🔧 開発

### CSS構造
- CSS変数を使用した統一されたデザインシステム
- BEM記法に準拠したクラス命名
- モジュラーなCSS構造

### JavaScript構造
- モジュラーなJavaScript構造
- イベント駆動のアーキテクチャ
- パフォーマンスを考慮した実装

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

## 📞 お問い合わせ

- Website: [https://synthera.website](https://synthera.website)
- Email: contact@synthera.website

---

© 2024 Synthera. All rights reserved.
