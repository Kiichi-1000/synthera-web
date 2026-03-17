# Cursor と GitHub のセットアップ状況

自動でここまで完了しています。

## 済：やったこと

1. **SSH キー作成**  
   - `~/.ssh/id_ed25519_github`（秘密鍵）と `.pub`（公開鍵）を作成済み  
   - `~/.ssh/config` に `Host github.com` でこのキーを使う設定を追加済み  

2. **Git の設定**  
   - `git config --global user.name` → `Kiichi-1000`  
   - `git config --global user.email` → `Kiichi-1000@users.noreply.github.com`  
   - リモートを HTTPS から **SSH** に変更済み: `git@github.com:Kiichi-1000/synthera-web.git`  

3. **公開鍵をクリップボードにコピー**  
   - すでにコピーしてあるので、**Cmd+V** で貼り付けできます。  

4. **GitHub CLI の認証**  
   - `gh auth login` を開始し、ブラウザで **https://github.com/login/device** を開いています。  

---

## あなたがやること（2ステップだけ）

### ステップ1: GitHub に SSH キーを1つ追加

1. ブラウザで **GitHub の「SSH keys」の新規追加ページ** が開いているはずです。  
   - 開いていない場合: https://github.com/settings/ssh/new?title=Cursor-Mac  

2. **Title:** そのまま `Cursor-Mac` で OK（変えても可）。  

3. **Key:** ここに **Cmd+V** で貼り付け（さきほどコピーした公開鍵が入ります）。  

4. **「Add SSH key」** をクリック。  

これで Cursor のターミナルから `git push` / `git pull` が SSH でできるようになります。

---

### ステップ2: GitHub デバイス認証（gh 用）

1. ブラウザで **https://github.com/login/device** が開いているはずです。  

2. 画面上の **「Enter code」** に、次のコードを入力します:  
   **B880-1884**  
   （このコードはクリップボードにもコピーしてあります。Cmd+V で貼り付け可。）  

3. **「Continue」** → **「Authorize」** をクリック。  

4. ターミナルに戻ると `gh auth login` が完了し、`gh` コマンドが使えるようになります。  

---

## 動作確認（両方やったあと）

Cursor のターミナルで:

```bash
# SSH で GitHub に接続できるか
ssh -T git@github.com
# → "Hi Kiichi-1000! You've successfully authenticated..." と出れば OK

# リポジトリで push できるか
cd /Users/tsukuikiichi/Documents/synthera-web/synthera-web
git push origin main
```

ここまでできれば、**Cursor と GitHub のセットアップは完了**です。

---

## 補足

- **名前・メールを変えたい場合**  
  `git config --global user.name "あなたの名前"`  
  `git config --global user.email "your@email.com"`  

- **SSH の秘密鍵**は `~/.ssh/id_ed25519_github` にあります。他人に渡さないでください。  

- このファイル（`docs/CURSOR_GITHUB_SETUP.md`）はセットアップ用のメモです。不要なら削除してかまいません。
