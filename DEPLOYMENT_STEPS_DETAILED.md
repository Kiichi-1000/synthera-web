# 🌐 Synthera Web サイト公開 詳細手順書

お名前.comで購入したドメインを使って、Synthera WebサイトをGoogle検索で見つけられるように公開する、画面クリックからコマンド入力まで全ての詳細な手順です。

---

## 📌 事前準備

### 必要なもの
- ✅ GitHubアカウント（既にある: `Kiichi-1000`）
- ✅ お名前.comで購入したドメイン
- ✅ ターミナル（macOSのターミナル）
- ✅ ブラウザ（Chrome推奨）

### 確認事項
- GitHubリポジトリ: `synthera-web`
- 現在のブランチ: `main`

---

## 📦 ステップ1: GitHubに最新ファイルをプッシュ

### 1-1. ターミナルを開く

1. **Spotlight検索**を開く: `Command + Space`キーを同時に押す
2. 「**ターミナル**」と入力してEnterキーを押す
3. ターミナルが開く

### 1-2. プロジェクトディレクトリに移動

ターミナルに以下のコマンドを1行ずつ入力してEnterキーを押す：

```bash
cd /Users/tsukuikiichi/Documents/synthera-web-1
```

**確認方法**: ターミナルの現在の行に `synthera-web-1` と表示されていることを確認

### 1-3. 変更されたファイルを確認

以下のコマンドを入力してEnterキー：

```bash
git status
```

**表示される内容**: 変更されたファイルの一覧が表示されます

### 1-4. 全ての変更をステージングに追加

以下のコマンドを入力してEnterキー：

```bash
git add .
```

**確認方法**: エラーメッセージが表示されなければOK

### 1-5. 変更をコミット

以下のコマンドを入力してEnterキー：

```bash
git commit -m "Add Notion integration and prepare for deployment"
```

**確認方法**: 
- `[main xxxxxxx] Add Notion integration...` のようなメッセージが表示されればOK
- エラーメッセージが出た場合は、以下のコマンドを実行：
  ```bash
  git config user.email "your-email@example.com"
  git config user.name "Your Name"
  ```
  その後、再度 `git commit` コマンドを実行

### 1-6. GitHubにプッシュ

以下のコマンドを入力してEnterキー：

```bash
git push origin main
```

**確認方法**:
- `Writing objects: 100%` のような進行状況が表示される
- 最後に `To https://github.com/Kiichi-1000/synthera-web.git` と表示されればOK
- パスワードを求められた場合は、GitHub Personal Access Tokenを入力

**エラーが出た場合**:
- 認証エラーの場合は、GitHub Personal Access Tokenを生成する必要があります
- https://github.com/settings/tokens でトークンを生成
- トークン生成時は「repo」のスコープを選択

### 1-7. GitHubで確認

1. ブラウザで https://github.com/Kiichi-1000/synthera-web を開く
2. ページ上部の「**commits**」リンクをクリック（コミット履歴が表示される）
3. 最新のコミットが「**Add Notion integration and prepare for deployment**」であることを確認

---

## 🚀 ステップ2: GitHub Pagesを有効化

### 2-1. GitHubリポジトリのSettingsページを開く

1. ブラウザで https://github.com/Kiichi-1000/synthera-web を開く
2. ページの上部を見る
3. タブメニューから「**Settings**」をクリック
   - 場所: Code, Issues, Pull requests, Actions, Projects, Wiki, Security, Insights の**右端**
   - もし見当たらない場合は、3点メニュー（...）をクリックして「Settings」を選択

### 2-2. Pages設定ページに移動

1. 左サイドバーをスクロールして「**Pages**」を探す
   - 場所: 「Access」セクションの下、「Code and automation」セクション内
   - アルファベット順で並んでいる場合は「P」の部分を探す
2. 「**Pages**」をクリック

### 2-3. ソースブランチを設定

1. 「**Source**」セクションを見つける
   - ページ上部の「Build and deployment」セクション内
2. ドロップダウンメニューをクリック（「None」と表示されている部分）
3. メニューから「**Deploy from a branch**」を選択
4. 2つのドロップダウンメニューが表示される：
   - 左側: 「**Branch**」のドロップダウンをクリック → 「**main**」を選択
   - 右側: 「**/ (root)**」を選択（既に選択されている場合もある）
5. 「**Save**」ボタンをクリック

### 2-4. サイトURLを確認

1. 設定を保存後、少し待つ（1-2分）
2. ページを更新（F5キーまたはCommand+Rキー）
3. 「**Your site is live at**」の下にURLが表示される
   - 例: `https://kiichi-1000.github.io/synthera-web/`
4. このURLをクリックして、サイトが表示されることを確認
   - **重要**: 初回は数分かかる場合があります。表示されない場合は5-10分待ってから再確認

---

## 🌍 ステップ3: お名前.comでのDNS設定

### 3-1. お名前.comにログイン

1. ブラウザで https://www.onamae.com/ を開く
2. ページ右上の「**ログイン**」ボタンをクリック
3. お名前.com IDとパスワードを入力
4. 「**ログイン**」ボタンをクリック

### 3-2. ドメイン管理ページに移動

1. ログイン後、ダッシュボードが表示されます
2. ページ上部のメニューから「**ドメイン**」を探す
   - または、左サイドメニューから「**ドメイン**」を探す
3. 「**ドメイン**」をクリック
4. 「**ネームサーバー設定**」または「**DNS設定**」をクリック

### 3-3. 設定するドメインを選択

1. 購入したドメインの一覧が表示されます
2. 設定したいドメイン名を見つける
3. そのドメインの「**DNS設定**」または「**ネームサーバー設定**」のリンクをクリック

### 3-4. DNSレコードを設定

#### A. 既存レコードの確認

1. 現在設定されているDNSレコードの一覧が表示されます
2. 既存のAレコードがある場合は、削除または変更が必要です

#### B. 新しいAレコードを追加

**1つ目のAレコードを追加:**

1. 「**レコード追加**」または「**追加**」ボタンをクリック
2. 「**レコードタイプ**」で「**A**」を選択（選択されている場合もある）
3. 以下の情報を入力：
   - **ホスト名**: `@` または空白のまま（ルートドメイン用）
   - **値（IPアドレス）**: `185.199.108.153`
   - **TTL**: `3600` または既定値のまま
4. 「**追加**」または「**保存**」ボタンをクリック

**2つ目のAレコードを追加:**

1. 再度「**レコード追加**」ボタンをクリック
2. レコードタイプ「**A**」を選択
3. 以下の情報を入力：
   - **ホスト名**: `@`
   - **値（IPアドレス）**: `185.199.109.153`
   - **TTL**: `3600`
4. 「**追加**」ボタンをクリック

**3つ目のAレコードを追加:**

1. 「**レコード追加**」ボタンをクリック
2. レコードタイプ「**A**」を選択
3. 以下の情報を入力：
   - **ホスト名**: `@`
   - **値（IPアドレス）**: `185.199.110.153`
   - **TTL**: `3600`
4. 「**追加**」ボタンをクリック

**4つ目のAレコードを追加:**

1. 「**レコード追加**」ボタンをクリック
2. レコードタイプ「**A**」を選択
3. 以下の情報を入力：
   - **ホスト名**: `@`
   - **値（IPアドレス）**: `185.199.111.153`
   - **TTL**: `3600`
4. 「**追加**」ボタンをクリック

**合計4つのAレコードが追加されたことを確認**

#### C. www用のCNAMEレコードを追加（オプション）

www付きでもアクセスできるようにする場合：

1. 「**レコード追加**」ボタンをクリック
2. レコードタイプで「**CNAME**」を選択
3. 以下の情報を入力：
   - **ホスト名**: `www`
   - **値**: `kiichi-1000.github.io`
   - **TTL**: `3600`
4. 「**追加**」ボタンをクリック

### 3-5. 設定を保存

1. 全てのレコードを追加したら、ページ下部の「**保存**」または「**適用**」ボタンをクリック
2. 確認ダイアログが表示されたら「**OK**」または「**確認**」をクリック
3. 「設定が完了しました」などのメッセージが表示されることを確認

### 3-6. DNS反映の確認

DNS設定の反映には数分〜最大48時間かかります（通常は数分〜数時間）。

**確認方法（ターミナルで実行）:**

1. ターミナルを開く
2. 以下のコマンドを実行（`yourdomain.com`を実際のドメインに置き換える）:
   ```bash
   nslookup yourdomain.com
   ```
3. 結果に `185.199.108.153` などのGitHub PagesのIPアドレスが表示されればOK

**または、オンラインツールで確認:**
- https://dnschecker.org/ を開く
- ドメイン名を入力して「**Search**」をクリック
- 世界各地のDNSサーバーでIPアドレスを確認

---

## 🔗 ステップ4: GitHub Pagesでカスタムドメインを設定

### 4-1. GitHubリポジトリのSettingsに戻る

1. ブラウザで https://github.com/Kiichi-1000/synthera-web を開く
2. 「**Settings**」タブをクリック
3. 左サイドバーの「**Pages**」をクリック

### 4-2. カスタムドメインを入力

1. 「**Custom domain**」セクションを見つける
   - 「Build and deployment」セクション内、「Source」の下
2. テキストボックスをクリック
3. 購入したドメインを入力（例: `yourdomain.com`）
   - **注意**: `https://` や `http://` は不要
   - `www` も付けない（ルートドメインのみ）
4. 「**Save**」ボタンをクリック

### 4-3. DNSチェックの確認

1. 「**Save**」をクリック後、警告やチェックマークが表示されます
2. 「**DNS check**」セクションで、DNS設定が正しいか確認
   - ✅ が表示されればOK
   - ❌ が表示される場合は、数分待ってからページを更新

### 4-4. Enforce HTTPSを有効化

**重要**: この設定は、DNS設定が反映されてから表示されます（数分〜数時間）

1. 「**Enforce HTTPS**」チェックボックスを探す
   - 「Custom domain」の下に表示されます
2. チェックボックスをクリックして有効化
   - グレーアウトされている場合は、まだDNSが反映されていません
   - 数分〜数時間待ってから再度確認

### 4-5. サイトの確認

1. 新しいタブを開く
2. アドレスバーに `https://yourdomain.com` を入力（実際のドメインに置き換える）
3. Enterキーを押す
4. サイトが表示されることを確認
5. ブラウザのアドレスバーの左側に🔒マークが表示されていることを確認（HTTPSが有効）

---

## 🔍 ステップ5: Google Search Consoleの設定

### 5-1. Google Search Consoleにアクセス

1. ブラウザで https://search.google.com/search-console を開く
2. Googleアカウントでログイン
   - 既にログインしている場合は、そのまま進む
   - ログインしていない場合は、右上の「**ログイン**」ボタンをクリック

### 5-2. プロパティを追加

1. ページ中央の「**プロパティを追加**」ボタンをクリック
   - または、左サイドバーの「**プロパティを追加**」をクリック
2. 「**URLプレフィックス**」を選択
   - 「URLプレフィックス」と「ドメイン名」の2つのオプションが表示されます
   - 「**URLプレフィックス**」のラジオボタンをクリック
3. サイトのURLを入力：
   - テキストボックスに `https://yourdomain.com` を入力（実際のドメインに置き換える）
   - `https://` を含める
4. 「**続行**」ボタンをクリック

### 5-3. 所有権の確認方法を選択

以下の2つの方法から選べます：

#### 方法A: HTMLファイルをアップロード（推奨）

1. 「**HTMLファイル**」タブをクリック
2. 「**このHTMLファイルをダウンロード**」リンクをクリック
   - ファイルがダウンロードされます（例: `google1234567890abcdef.html`）
3. ダウンロードしたファイルを確認：
   - 通常、`~/Downloads/` フォルダに保存されます
   - ファイル名をメモしておく（後で使います）

**ファイルをサイトに配置:**

4. ターミナルを開く
5. 以下のコマンドを実行（ファイル名は実際のものに置き換える）:
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   cp ~/Downloads/google*.html .
   ```
   - このコマンドで、ダウンロードしたファイルをプロジェクトディレクトリにコピーします

**GitHubにプッシュ:**

6. 以下のコマンドを順番に実行:
   ```bash
   git add google*.html
   git commit -m "Add Google Search Console verification file"
   git push origin main
   ```

7. GitHubにプッシュ後、**5-10分待つ**（GitHub Pagesが更新されるまで）

8. Google Search Consoleに戻る
9. 「**確認**」ボタンをクリック
10. 確認が成功すると、「**所有権が確認されました**」というメッセージが表示されます

#### 方法B: HTMLタグ（簡単）

1. 「**HTMLタグ**」タブをクリック
2. 表示されたメタタグをコピー：
   - 例: `<meta name="google-site-verification" content="xxxxxxxxxxxxxxxxxxxx" />`
   - テキストを全て選択（Command+A）してコピー（Command+C）

**index.htmlに追加:**

3. `index.html` ファイルを開く：
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   open -a "Visual Studio Code" index.html
   ```
   - または、Finderでファイルを見つけて、任意のエディタで開く

4. `<head>` タグの中に、コピーしたメタタグを貼り付け：
   - `<head>` と `</head>` の間の任意の場所に貼り付け（Command+V）
   - 例:
     ```html
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="google-site-verification" content="xxxxxxxxxxxxxxxxxxxx" />
       <!-- 他のメタタグ -->
     </head>
     ```

5. ファイルを保存（Command+S）

**GitHubにプッシュ:**

6. ターミナルで以下のコマンドを実行:
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   git add index.html
   git commit -m "Add Google Search Console verification tag"
   git push origin main
   ```

7. GitHubにプッシュ後、**5-10分待つ**

8. Google Search Consoleに戻る
9. 「**確認**」ボタンをクリック
10. 確認が成功すると、「**所有権が確認されました**」というメッセージが表示されます

### 5-4. サイトマップを送信

1. 左サイドメニューで「**サイトマップ**」をクリック
   - 「インデックス登録」セクション内
2. 「**新しいサイトマップの追加**」テキストボックスを見つける
3. `sitemap.xml` と入力
   - `https://` やドメイン名は不要
4. 「**送信**」ボタンをクリック
5. 「**送信されたサイトマップ**」の下に `sitemap.xml` が表示されることを確認

---

## 📄 ステップ6: サイトマップとrobots.txtの更新

### 6-1. サイトマップファイルを更新

サイトマップファイル（`sitemap.xml`）のドメインを実際のドメインに更新する必要があります。

1. ターミナルで以下を実行:
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   open -a "Visual Studio Code" sitemap.xml
   ```
   - または、Finderでファイルを見つけてエディタで開く

2. ファイル内の `yourdomain.com` を実際のドメインに置き換える
   - 「検索と置換」機能を使用（Command+F → 右側の「置換」をクリック）
   - 検索: `yourdomain.com`
   - 置換: 実際のドメイン（例: `synthera.com`）
   - 「すべて置換」をクリック

3. 日付を更新（オプション）:
   - `<lastmod>2024-01-20</lastmod>` を今日の日付に変更
   - 例: `<lastmod>2024-11-19</lastmod>`

4. ファイルを保存（Command+S）

### 6-2. robots.txtを更新

1. ターミナルで以下を実行:
   ```bash
   open -a "Visual Studio Code" robots.txt
   ```

2. ファイル内の `yourdomain.com` を実際のドメインに置き換える
   - 検索と置換機能を使用

3. ファイルを保存（Command+S）

### 6-3. GitHubにプッシュ

1. ターミナルで以下のコマンドを実行:
   ```bash
   cd /Users/tsukuikiichi/Documents/synthera-web-1
   git add sitemap.xml robots.txt
   git commit -m "Update sitemap and robots.txt with actual domain"
   git push origin main
   ```

---

## ⏰ ステップ7: インデックス登録の確認

### 7-1. Google Search Consoleでインデックス状況を確認

1. Google Search Consoleにログイン
2. 左サイドメニューの「**URL検査**」をクリック
3. サイトのURLを入力（例: `https://yourdomain.com`）
4. 「**Enterキー**」を押す
5. 「**インデックス登録をリクエスト**」ボタンをクリック（表示されている場合）

### 7-2. 検索結果に表示されるまで

- **通常**: 数日〜数週間かかります
- **早い場合**: 数時間〜1日で表示される場合もあります
- **サイトマップを送信した場合**: より早くインデックスされる可能性があります

### 7-3. インデックス確認方法

1. Googleで検索:
   - `site:yourdomain.com` と入力して検索
   - サイトのページが表示されればインデックスされています

---

## ✅ 完了確認チェックリスト

以下の項目が全て完了していることを確認してください：

- [ ] GitHubに最新ファイルをプッシュした
- [ ] GitHub Pagesが有効化され、`https://kiichi-1000.github.io/synthera-web/` でサイトが表示される
- [ ] お名前.comで4つのAレコードを追加した
- [ ] DNS設定が反映された（nslookupで確認）
- [ ] GitHub Pagesでカスタムドメインを設定した
- [ ] `https://yourdomain.com` でサイトが表示される
- [ ] HTTPSが有効化されている（🔒マークが表示される）
- [ ] Google Search Consoleで所有権を確認した
- [ ] サイトマップを送信した
- [ ] sitemap.xmlとrobots.txtを実際のドメインに更新してプッシュした

---

## 🆘 トラブルシューティング

### DNSが反映されない

**確認方法:**
```bash
nslookup yourdomain.com
```

**解決方法:**
- お名前.comのDNS設定を再度確認
- TTLが短い値（3600）に設定されているか確認
- 24時間待ってから再度確認

### サイトが表示されない

**確認方法:**
1. GitHub Pagesの設定を確認
2. `index.html` がルートディレクトリにあるか確認

**解決方法:**
- ブラウザのキャッシュをクリア（Command+Shift+Delete）
- シークレットモードでアクセスしてみる

### HTTPSが有効化されない

**解決方法:**
- 「Enforce HTTPS」チェックボックスが表示されるまで待つ（最大24時間）
- カスタムドメインの設定が正しいか確認
- DNS設定が正しく反映されているか確認

---

## 📚 参考リンク

- GitHub Pages ドキュメント: https://docs.github.com/ja/pages
- Google Search Console: https://search.google.com/search-console
- お名前.com ヘルプ: https://www.onamae.com/support/

---

## 🎉 完了！

これで、お名前.comで購入したドメインを使って、Synthera WebサイトをWeb上で公開できました！

サイトがGoogleの検索結果に表示されるには、数日〜数週間かかる場合があります。定期的にコンテンツを更新することで、検索エンジンにインデックスされやすくなります。

