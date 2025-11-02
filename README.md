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
│   └── notion-integration.js # Notion連携機能
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

1. [Notion Developers](https://developers.notion.com/)でAPIキーを取得
2. `.unity-mcp/config.json`の`NOTION_API_KEY`を更新
3. データベースIDを`js/notion-integration.js`の`NOTION_CONFIG.databaseId`に設定

### 3. ローカルサーバーの起動

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

### ノートページ
- Notionデータベースからの記事取得
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
