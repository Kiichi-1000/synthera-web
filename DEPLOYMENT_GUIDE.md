# Synthera Web デプロイメントガイド

お名前.comで購入したドメインを使って、Synthera Webサイトを公開する詳細な手順です。

## 📋 必要な情報

- GitHubアカウント: `Kiichi-1000`
- GitHubリポジトリ: `synthera-web`
- お名前.comで購入したドメイン: （例: `yourdomain.com`）

---

## ステップ1: GitHubに最新ファイルをプッシュ

### 1-1. 変更をコミット

ターミナルで以下のコマンドを実行：

```bash
cd /Users/tsukuikiichi/Documents/synthera-web-1
git add .
git commit -m "Add Notion integration and update site files"
```

### 1-2. GitHubにプッシュ

```bash
git push origin main
```

### 1-3. プッシュの確認

1. ブラウザで https://github.com/Kiichi-1000/synthera-web を開く
2. 最新のコミットが表示されていることを確認

---

## ステップ2: GitHub Pagesの設定

### 2-1. GitHubリポジトリの設定ページを開く

1. ブラウザで https://github.com/Kiichi-1000/synthera-web を開く
2. ページ上部のメニューから「**Settings**」をクリック
   - Settingsはページ上部のタブメニューにあります（Code, Issues, Pull requests, Actions, Projects, Wiki, Security, Insights の右側）

### 2-2. Pages設定に移動

1. 左サイドバーで「**Pages**」をクリック
   - 左サイドバーの「Code and automation」セクション内にあります

### 2-3. ソースを設定

1. 「**Source**」セクションで、ドロップダウンメニューをクリック
2. 「**Deploy from a branch**」を選択
3. 「**Branch**」のドロップダウンで「**main**」を選択
4. 「**/ (root)**」を選択（フォルダのドロップダウン）
5. 「**Save**」ボタンをクリック

### 2-4. サイトURLの確認

1. 設定後、少し待つ（1-2分）
2. 「**Your site is live at**」の下に表示されるURLを確認
   - 例: `https://kiichi-1000.github.io/synthera-web/`
3. このURLをクリックして、サイトが表示されることを確認

---

## ステップ3: お名前.comでのDNS設定

### 3-1. お名前.comのログイン

1. ブラウザで https://www.onamae.com/ を開く
2. 「ログイン」ボタンをクリック
3. お名前.com IDとパスワードを入力してログイン

### 3-2. ドメイン管理に移動

1. ログイン後、ダッシュボードが表示されます
2. 左サイドメニューまたはトップページから「**ドメイン**」をクリック
3. 「**ドメイン一覧**」または「**ネームサーバー設定**」をクリック

### 3-3. 設定するドメインを選択

1. 購入したドメインの一覧が表示されます
2. 設定したいドメインの「**DNS設定**」または「**ネームサーバー設定**」をクリック

### 3-4. DNSレコードを追加

以下のDNSレコードを追加します：

#### Aレコード（IPv4アドレス）
1. 「**Aレコード**」または「**DNSレコード追加**」をクリック
2. 以下の4つのAレコードを追加：

```
レコード名: @（または空白）
値（IPアドレス）: 185.199.108.153
TTL: 3600

レコード名: @（または空白）
値（IPアドレス）: 185.199.109.153
TTL: 3600

レコード名: @（または空白）
値（IPアドレス）: 185.199.110.153
TTL: 3600

レコード名: @（または空白）
値（IPアドレス）: 185.199.111.153
TTL: 3600
```

#### www用のCNAMEレコード（オプション）
1. 「**CNAMEレコード**」をクリック
2. 以下の設定を追加：

```
レコード名: www
値: kiichi-1000.github.io
TTL: 3600
```

### 3-5. 既存レコードの確認

- 既存のAレコードやCNAMEレコードがある場合は、GitHub Pages用の設定に変更します
- 不要なレコードは削除してください

### 3-6. 設定を保存

1. 「**保存**」または「**適用**」ボタンをクリック
2. 確認ダイアログで「**OK**」をクリック
3. 「設定が完了しました」などのメッセージが表示されることを確認

### 3-7. DNS反映の確認

DNSの反映には数分〜最大48時間かかる場合がありますが、通常は数分〜数時間です。

---

## ステップ4: GitHub Pagesでカスタムドメインを設定

### 4-1. GitHubリポジトリのSettingsページに戻る

1. https://github.com/Kiichi-1000/synthera-web を開く
2. 「**Settings**」タブをクリック
3. 左サイドバーの「**Pages**」をクリック

### 4-2. カスタムドメインを入力

1. 「**Custom domain**」セクションを見つける
2. テキストボックスに購入したドメインを入力
   - 例: `yourdomain.com` または `www.yourdomain.com`
3. 「**Save**」ボタンをクリック

### 4-3. 「Enforce HTTPS」を有効化

1. 「**Enforce HTTPS**」チェックボックスをクリック
   - このチェックボックスは、DNS設定が反映されてから表示されます（数分〜数時間かかる場合があります）
2. チェックが入っていることを確認

### 4-4. 反映の確認

1. 数分待ってから、カスタムドメインにアクセス
   - 例: `https://yourdomain.com`
2. サイトが表示されることを確認
3. ブラウザのアドレスバーに🔒マークが表示されていることを確認（HTTPSが有効）

---

## ステップ5: Google Search Consoleの設定

### 5-1. Google Search Consoleにアクセス

1. ブラウザで https://search.google.com/search-console を開く
2. Googleアカウントでログイン

### 5-2. プロパティを追加

1. 「**プロパティを追加**」ボタンをクリック
2. 「**URLプレフィックス**」を選択
3. サイトのURLを入力
   - 例: `https://yourdomain.com`
4. 「**続行**」ボタンをクリック

### 5-3. 所有権の確認

以下の方法のいずれかで所有権を確認します：

#### 方法A: HTMLファイルをアップロード（推奨）

1. 「**HTMLファイル**」タブをクリック
2. ダウンロードリンクをクリックしてHTMLファイルをダウンロード
3. そのファイルをサイトのルートディレクトリ（`/Users/tsukuikiichi/Documents/synthera-web-1/`）に配置
4. GitHubにプッシュ：
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   git add google*.html
   git commit -m "Add Google Search Console verification file"
   git push origin main
   ```
5. GitHubにプッシュ後、数分待つ
6. Google Search Consoleで「**確認**」ボタンをクリック

#### 方法B: HTMLタグ

1. 「**HTMLタグ**」タブをクリック
2. 表示されたメタタグをコピー
3. サイトの`index.html`の`<head>`セクションに貼り付け
4. GitHubにプッシュ：
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   git add index.html
   git commit -m "Add Google Search Console verification tag"
   git push origin main
   ```
5. GitHubにプッシュ後、数分待つ
6. Google Search Consoleで「**確認**」ボタンをクリック

### 5-4. サイトマップを送信

1. Search Consoleで左サイドメニューの「**サイトマップ**」をクリック
2. 「**新しいサイトマップの追加**」に `sitemap.xml` と入力
3. 「**送信**」ボタンをクリック
   - （注意：サイトマップファイルは後で作成します）

---

## ステップ6: サイトマップの作成

### 6-1. サイトマップファイルを作成

サイトのルートディレクトリに `sitemap.xml` を作成します。

### 6-2. robots.txtの作成

サイトのルートディレクトリに `robots.txt` を作成します。

---

## ステップ7: サイトが検索エンジンにインデックスされるまでの期間

- 通常、Googleのインデックスには数日〜数週間かかります
- Search Consoleでインデックスの状況を確認できます
- サイトマップを送信することで、インデックスが早まる可能性があります

---

## 🔍 トラブルシューティング

### DNSが反映されない場合

1. DNS設定が正しいか確認（AレコードのIPアドレス）
2. コマンドプロンプト（ターミナル）で以下を実行：
   ```bash
   nslookup yourdomain.com
   ```
3. 結果がGitHub PagesのIPアドレス（185.199.108.153など）を返しているか確認

### HTTPSが有効化されない場合

1. 「Enforce HTTPS」チェックボックスが表示されるまで待つ（最大24時間）
2. カスタムドメインの設定が正しいか確認
3. DNS設定が正しく反映されているか確認

### サイトが表示されない場合

1. GitHub Pagesの設定が正しいか確認
2. `index.html`がルートディレクトリにあるか確認
3. ブラウザのキャッシュをクリアして再読み込み

---

## 📝 次のステップ

サイトが公開されたら：
1. Google Analyticsを設定
2. ソーシャルメディア用のOGPタグを最適化
3. サイトのパフォーマンスを最適化
4. 定期的にコンテンツを更新

