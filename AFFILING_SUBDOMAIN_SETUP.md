# 🌐 Affiling サブドメイン設定 詳細手順書

Affilingページを `affiling.yourdomain.com` として独立したサブドメインで公開する、画面クリックからコマンド入力まで全ての詳細な手順です。

## 📋 なぜサブドメインを使うのか？

### 検索エンジン最適化のメリット
- ✅ **独立したサイトとして認識**: メインサイトとは別の専門サイトとして扱われる
- ✅ **ドメイン権威の向上**: 特定トピックに特化したサイトとして評価されやすい
- ✅ **独立したサイトマップ**: メインサイトとは別のサイトマップを設定できる
- ✅ **コンテンツの明確な分離**: 比較・レビューサイトとして明確に識別される

### サブドメインの例
- メインサイト: `yourdomain.com`
- Affilingサイト: `affiling.yourdomain.com`

---

## 📦 ステップ1: 新しいGitHubリポジトリを作成

### 1-1. GitHubでリポジトリを作成

1. ブラウザで https://github.com/Kiichi-1000 を開く
2. ページ上部の「**Repositories**」タブをクリック
3. ページ右上の「**New**」ボタンをクリック（緑色のボタン）
   - または、`https://github.com/new` を直接開く

### 1-2. リポジトリ情報を入力

1. 「**Repository name**」テキストボックスをクリック
2. `synthera-affiling` と入力（リポジトリ名）
3. 「**Description**」テキストボックスをクリック（オプション）
4. `Affiling - 比較・レビューサイト` などと入力
5. 「**Public**」ラジオボタンをクリック（公開リポジトリ）
   - または「**Private**」でも可（公開したい場合はPublic推奨）
6. 「**Add a README file**」チェックボックスは**チェックを外す**（既存ファイルをアップロードするため）
7. 「**Add .gitignore**」も**チェックを外す**
8. 「**Choose a license**」も「**None**」のまま
9. ページ下部の「**Create repository**」ボタンをクリック（緑色）

### 1-3. リポジトリが作成されたことを確認

1. `https://github.com/Kiichi-1000/synthera-affiling` にリダイレクトされる
2. ページが表示されることを確認

---

## 📂 ステップ2: Affiling関連ファイルを新しいリポジトリにコピー

### 2-1. Affiling専用のフォルダを作成

1. ターミナルを開く: `Command + Space` → 「ターミナル」と入力
2. 以下のコマンドを実行して、新しいディレクトリを作成:

```bash
cd /Users/tsukuikiichi/Documents
mkdir synthera-affiling
cd synthera-affiling
```

### 2-2. 必要なファイルをコピー

ターミナルで以下のコマンドを順番に実行:

```bash
# プロジェクトディレクトリに移動
cd /Users/tsukuikiichi/Documents/synthera-web-1

# 新しいリポジトリ用ディレクトリを作成
mkdir -p ../synthera-affiling

# Affiling関連のファイルをコピー
cp affiling.html ../synthera-affiling/
cp affiling-article.html ../synthera-affiling/
cp css/affiling.css ../synthera-affiling/css/ -r
cp js/affiling.js ../synthera-affiling/js/
cp assets/icons/favicon.svg ../synthera-affiling/assets/icons/ -r

# データディレクトリとスクリプトもコピー
cp data/affiling_articles.json ../synthera-affiling/data/ -r
cp scripts/sync_affiling_articles.py ../synthera-affiling/scripts/ -r

# 新しいディレクトリに移動
cd ../synthera-affiling
```

### 2-3. ディレクトリ構造を確認

```bash
# 現在のディレクトリを確認
pwd

# ファイル一覧を確認
ls -la
```

**確認すべきファイル:**
- `affiling.html`
- `affiling-article.html`
- `css/affiling.css`
- `js/affiling.js`
- `assets/icons/favicon.svg`
- `data/affiling_articles.json`
- `scripts/sync_affiling_articles.py`

### 2-4. index.htmlを作成

Affilingサイトのトップページとして、`affiling.html` を `index.html` にコピー:

```bash
cp affiling.html index.html
```

### 2-5. 必要なディレクトリ構造を作成

```bash
# 必要なディレクトリが存在することを確認
mkdir -p css
mkdir -p js
mkdir -p data
mkdir -p scripts
mkdir -p assets/icons
```

---

## 🔗 ステップ3: 新しいリポジトリをGitHubにプッシュ

### 3-1. Gitリポジトリを初期化

ターミナルで以下のコマンドを実行:

```bash
cd /Users/tsukuikiichi/Documents/synthera-affiling

# Gitリポジトリを初期化
git init

# 全てのファイルをステージングに追加
git add .

# 初回コミット
git commit -m "Initial commit: Affiling site setup"
```

### 3-2. GitHubリポジトリと接続

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/Kiichi-1000/synthera-affiling.git

# mainブランチに名前を変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**パスワードが求められた場合:**
- GitHub Personal Access Tokenを入力
- トークンがない場合は、https://github.com/settings/tokens で作成
- トークン生成時は「repo」スコープを選択

### 3-3. プッシュの確認

1. ブラウザで https://github.com/Kiichi-1000/synthera-affiling を開く
2. ファイル一覧が表示されることを確認
3. `affiling.html`, `index.html`, `css/`, `js/` などが表示されていることを確認

---

## 🚀 ステップ4: GitHub Pagesを有効化

### 4-1. GitHubリポジトリのSettingsページを開く

1. ブラウザで https://github.com/Kiichi-1000/synthera-affiling を開く
2. ページ上部のタブメニューから「**Settings**」をクリック
   - 場所: Code, Issues, Pull requests, Actions, Projects, Wiki, Security, Insights の**右端**

### 4-2. Pages設定ページに移動

1. 左サイドバーをスクロールして「**Pages**」を探す
   - 場所: 「Access」セクションの下、「Code and automation」セクション内
2. 「**Pages**」をクリック

### 4-3. ソースブランチを設定

1. 「**Source**」セクションを見つける
   - ページ上部の「Build and deployment」セクション内
2. ドロップダウンメニューをクリック（「None」と表示されている部分）
3. メニューから「**Deploy from a branch**」を選択
4. 2つのドロップダウンメニューが表示される：
   - 左側: 「**Branch**」のドロップダウンをクリック → 「**main**」を選択
   - 右側: 「**/ (root)**」を選択（既に選択されている場合もある）
5. 「**Save**」ボタンをクリック

### 4-4. サイトURLを確認

1. 設定を保存後、少し待つ（1-2分）
2. ページを更新（F5キーまたはCommand+Rキー）
3. 「**Your site is live at**」の下にURLが表示される
   - 例: `https://kiichi-1000.github.io/synthera-affiling/`
4. このURLをクリックして、Affilingサイトが表示されることを確認
   - **重要**: 初回は数分かかる場合があります。表示されない場合は5-10分待ってから再確認

---

## 🌍 ステップ5: お名前.comでのDNS設定（CNAMEレコード）

### 5-1. お名前.comにログイン

1. ブラウザで https://www.onamae.com/ を開く
2. ページ右上の「**ログイン**」ボタンをクリック
3. お名前.com IDとパスワードを入力
4. 「**ログイン**」ボタンをクリック

### 5-2. DNS設定ページに移動

1. ログイン後、ダッシュボードが表示されます
2. ページ上部のメニューから「**ドメイン**」を探す
   - または、左サイドメニューから「**ドメイン**」を探す
3. 「**ドメイン**」をクリック
4. 「**ネームサーバー設定**」または「**DNS設定**」をクリック

### 5-3. 設定するドメインを選択

1. 購入したドメインの一覧が表示されます
2. 設定したいドメイン名を見つける
3. そのドメインの「**DNS設定**」または「**ネームサーバー設定**」のリンクをクリック

### 5-4. CNAMEレコードを追加

1. 現在のDNSレコード一覧が表示されます
2. 「**レコード追加**」または「**追加**」ボタンをクリック
   - ページ上部または下部にボタンがあります
   - ボタンの見つけ方: 「追加」「レコード追加」「新規追加」などのボタンを探す

3. 「**レコードタイプ**」のドロップダウンメニューをクリック
   - ドロップダウンメニューの場所を探す（通常、左側の列）
4. メニューから「**CNAME**」を選択
   - メニューにA、AAAA、CNAME、MX、TXTなどのオプションが表示される
   - 「**CNAME**」をクリック

5. 以下の情報を入力：

**設定内容:**

- **ホスト名（または名前）**: テキストボックスをクリックして `affiling` と入力
  - **重要**: `affiling.yourdomain.com` ではなく、`affiling` だけを入力
  - 例: `affiling`
  - これにより `affiling.yourdomain.com` が作成されます

- **値（または名前、ターゲット）**: テキストボックスをクリックして `kiichi-1000.github.io` と入力
  - **重要**: リポジトリ名（`synthera-affiling`など）は含めない
  - **重要**: `.github.io` までを含める
  - 例: `kiichi-1000.github.io`
  - これにより、`affiling.yourdomain.com` が `kiichi-1000.github.io` を指すようになります

- **TTL**: `3600` を入力、または既定値のまま
  - TTLは「Time To Live」の略で、DNSキャッシュの有効期限（秒単位）
  - 3600 = 1時間

6. 「**追加**」または「**保存**」ボタンをクリック
   - ボタンの見つけ方: フォームの下部に「追加」「保存」「登録」などのボタンがある

7. 設定が追加されたことを確認
   - 一覧に新しいCNAMEレコードが表示されることを確認
   - 表示内容: `affiling` / `CNAME` / `kiichi-1000.github.io` / `3600`

### 5-5. 設定を保存

1. 全てのレコードを追加したら、ページ下部の「**保存**」または「**適用**」ボタンをクリック
   - ボタンの見つけ方: ページの最下部、または右上に「保存」「適用」「変更を保存」などのボタンがある
2. 確認ダイアログが表示されたら「**OK**」または「**確認**」をクリック
3. 「設定が完了しました」などのメッセージが表示されることを確認

### 5-6. DNS反映の確認

DNS設定の反映には数分〜数時間かかります（通常は数分〜数時間）。

**確認方法（ターミナルで実行）:**

1. ターミナルを開く
2. 以下のコマンドを実行（`yourdomain.com`を実際のドメインに置き換える）:

```bash
nslookup affiling.yourdomain.com
```

3. 結果を確認:
   - ✅ 成功: `kiichi-1000.github.io` と表示されればOK
   - ❌ 失敗: 「No answer」や異なるIPアドレスが表示される場合は、数分待ってから再度確認

**または、オンラインツールで確認:**
- https://dnschecker.org/ を開く
- `affiling.yourdomain.com` を入力して「**Search**」をクリック
- 世界各地のDNSサーバーでCNAMEレコードを確認

---

## 🔗 ステップ6: GitHub Pagesでカスタムドメインを設定

### 6-1. GitHubリポジトリのSettingsページに戻る

1. ブラウザで https://github.com/Kiichi-1000/synthera-affiling を開く
2. 「**Settings**」タブをクリック
3. 左サイドバーの「**Pages**」をクリック

### 6-2. カスタムドメインを入力

1. 「**Custom domain**」セクションを見つける
   - 「Build and deployment」セクション内、「Source」の下
2. テキストボックスをクリック
3. サブドメインを入力: `affiling.yourdomain.com`
   - **重要**: `https://` や `http://` は不要
   - **重要**: フルサブドメイン名を入力（`affiling.yourdomain.com`）
4. 「**Save**」ボタンをクリック

### 6-3. DNSチェックの確認

1. 「**Save**」をクリック後、警告やチェックマークが表示されます
2. 「**DNS check**」セクションで、DNS設定が正しいか確認
   - ✅ が表示されればOK
   - ❌ が表示される場合は、数分待ってからページを更新（F5キー）

### 6-4. Enforce HTTPSを有効化

**重要**: この設定は、DNS設定が反映されてから表示されます（数分〜数時間）

1. 「**Enforce HTTPS**」チェックボックスを探す
   - 「Custom domain」の下に表示されます
   - グレーアウトされている場合は、まだDNSが反映されていません
2. チェックボックスをクリックして有効化
   - グレーアウトされている場合は、数分〜数時間待ってから再度確認

### 6-5. サイトの確認

1. 新しいタブを開く
2. アドレスバーに `https://affiling.yourdomain.com` を入力（実際のドメインに置き換える）
3. Enterキーを押す
4. Affilingサイトが表示されることを確認
5. ブラウザのアドレスバーの左側に🔒マークが表示されていることを確認（HTTPSが有効）

---

## 🔍 ステップ7: Google Search Consoleでサブドメインを登録

### 7-1. Google Search Consoleにアクセス

1. ブラウザで https://search.google.com/search-console を開く
2. Googleアカウントでログイン

### 7-2. 新しいプロパティを追加

1. ページ中央の「**プロパティを追加**」ボタンをクリック
   - または、左サイドバーの「**プロパティを追加**」をクリック
2. 「**URLプレフィックス**」を選択
   - 「URLプレフィックス」と「ドメイン名」の2つのオプションが表示されます
   - 「**URLプレフィックス**」のラジオボタンをクリック
3. サブドメインのURLを入力：
   - テキストボックスに `https://affiling.yourdomain.com` を入力（実際のドメインに置き換える）
   - `https://` を含める
4. 「**続行**」ボタンをクリック

### 7-3. 所有権の確認

#### 方法A: HTMLファイルをアップロード（推奨）

1. 「**HTMLファイル**」タブをクリック
2. 「**このHTMLファイルをダウンロード**」リンクをクリック
   - ファイルがダウンロードされます（例: `google1234567890abcdef.html`）
3. ダウンロードしたファイルを確認：
   - 通常、`~/Downloads/` フォルダに保存されます

**ファイルをサイトに配置:**

4. ターミナルを開く
5. 以下のコマンドを実行（ファイル名は実際のものに置き換える）:

```bash
cd /Users/tsukuikiichi/Documents/synthera-affiling
cp ~/Downloads/google*.html .
```

**GitHubにプッシュ:**

6. 以下のコマンドを順番に実行:

```bash
cd /Users/tsukuikiichi/Documents/synthera-affiling
git add google*.html
git commit -m "Add Google Search Console verification file"
git push origin main
```

7. GitHubにプッシュ後、**5-10分待つ**（GitHub Pagesが更新されるまで）

8. Google Search Consoleに戻る
9. 「**確認**」ボタンをクリック
10. 確認が成功すると、「**所有権が確認されました**」というメッセージが表示されます

### 7-4. サイトマップを送信

1. 左サイドメニューで「**サイトマップ**」をクリック
   - 「インデックス登録」セクション内
2. 「**新しいサイトマップの追加**」テキストボックスを見つける
3. `sitemap.xml` と入力
   - `https://` やドメイン名は不要
4. 「**送信**」ボタンをクリック
5. 「**送信されたサイトマップ**」の下に `sitemap.xml` が表示されることを確認

---

## 📄 ステップ8: サイトマップとrobots.txtを作成

### 8-1. サイトマップファイルを作成

Affiling専用のサイトマップを作成します。

1. ターミナルで以下を実行:

```bash
cd /Users/tsukuikiichi/Documents/synthera-affiling
```

2. エディタで `sitemap.xml` を作成:

```bash
open -a "Visual Studio Code" sitemap.xml
```

3. 以下の内容を入力（`yourdomain.com`を実際のドメインに置き換える）:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://affiling.yourdomain.com/</loc>
    <lastmod>2024-11-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

4. ファイルを保存（Command+S）

### 8-2. robots.txtを作成

1. ターミナルで以下を実行:

```bash
open -a "Visual Studio Code" robots.txt
```

2. 以下の内容を入力（`yourdomain.com`を実際のドメインに置き換える）:

```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://affiling.yourdomain.com/sitemap.xml
```

3. ファイルを保存（Command+S）

### 8-3. GitHubにプッシュ

```bash
cd /Users/tsukuikiichi/Documents/synthera-affiling
git add sitemap.xml robots.txt
git commit -m "Add sitemap and robots.txt for Affiling subdomain"
git push origin main
```

---

## 🔄 ステップ9: メインサイトからAffilingへのリンクを更新

メインサイト（`yourdomain.com`）からAffilingサイト（`affiling.yourdomain.com`）へのリンクを更新する必要があります。

### 9-1. メインサイトのナビゲーションを確認

1. `index.html` や `projects.html` など、Affilingへのリンクがあるページを確認
2. リンクが `affiling.html` になっている場合は、`https://affiling.yourdomain.com` に更新

### 9-2. リンクを更新

例: `projects.html` のAffilingへのリンクを更新する場合

1. `projects.html` を開く
2. `href="affiling.html"` を `href="https://affiling.yourdomain.com"` に変更

---

## 📊 検索エンジン最適化の追加設定

### SEO設定

1. **独立したOGPタグ**: `affiling.html` と `affiling-article.html` にOGPタグを設定
2. **構造化データ**: JSON-LDでArticle構造化データを追加
3. **サイトマップ**: 定期的に更新（新しい記事が追加されたら）

### コンテンツ戦略

- メインサイトとは別のコンテンツとして扱われる
- 独立した検索ランキングを獲得できる
- より専門的なサイトとして認識される

---

## ✅ 完了確認チェックリスト

以下の項目が全て完了していることを確認してください：

- [ ] 新しいGitHubリポジトリ `synthera-affiling` を作成した
- [ ] Affiling関連ファイルを新しいリポジトリにコピーした
- [ ] GitHubにファイルをプッシュした
- [ ] GitHub Pagesが有効化され、`https://kiichi-1000.github.io/synthera-affiling/` でサイトが表示される
- [ ] お名前.comでCNAMEレコード（`affiling` → `kiichi-1000.github.io`）を追加した
- [ ] DNS設定が反映された（nslookupで確認）
- [ ] GitHub Pagesでカスタムドメイン（`affiling.yourdomain.com`）を設定した
- [ ] `https://affiling.yourdomain.com` でサイトが表示される
- [ ] HTTPSが有効化されている（🔒マークが表示される）
- [ ] Google Search Consoleで所有権を確認した
- [ ] サイトマップを送信した
- [ ] sitemap.xmlとrobots.txtを作成してプッシュした

---

## 🎉 完了！

これで、Affilingサイトが独立したサブドメイン（`affiling.yourdomain.com`）として公開され、検索エンジンにインデックスされやすくなりました！

### 次のステップ

1. **定期的にコンテンツを更新**: 新しい記事を追加することで、検索エンジンにインデックスされやすくなります
2. **サイトマップを更新**: 新しい記事が追加されたら、サイトマップを更新してSearch Consoleに再送信
3. **メインサイトとの相互リンク**: メインサイトとAffilingサイトの間で相互リンクを設定することで、SEO効果が向上します

---

## 🆘 トラブルシューティング

### サブドメインが表示されない

**確認方法:**
```bash
nslookup affiling.yourdomain.com
```

**解決方法:**
1. お名前.comのDNS設定を確認（ホスト名が `affiling` になっているか）
2. CNAMEレコードの値が `kiichi-1000.github.io` になっているか確認
3. 数時間待ってから再度確認

### GitHub Pagesでカスタムドメインが設定できない

**解決方法:**
1. DNS設定が正しく反映されているか確認
2. GitHub Pagesの設定を一度削除して、再度設定してみる
3. リポジトリが正しく設定されているか確認

### メインサイトとサブドメインで同じコンテンツが表示される

**原因:**
- ファイルが正しくコピーされていない
- `index.html` が正しく作成されていない

**解決方法:**
1. 新しいリポジトリのファイル構成を確認
2. `affiling.html` を `index.html` にコピーしたか確認
3. 正しいファイルがプッシュされているか確認

---

## 📚 参考リンク

- GitHub Pages カスタムドメイン: https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site
- Google Search Console: https://search.google.com/search-console
- お名前.com ヘルプ: https://www.onamae.com/support/

