# GitHub REST API クイックスタート

[GitHub REST API Quickstart](https://docs.github.com/en/rest/quickstart) に基づくセットアップ手順です。

## 方法1: GitHub CLI（推奨・コマンドライン）

認証とリクエストが最も簡単です。

### 1. GitHub CLI のインストール

**macOS (Homebrew):**
```bash
brew install gh
```

**Windows:** [GitHub CLI リリース](https://github.com/cli/cli/releases) からインストーラーを取得。

### 2. 認証

```bash
gh auth login
```

- **Where do you want to authenticate?** → `GitHub.com` を選択
- **What is your preferred protocol?** → `HTTPS` を選ぶと、以降の `git push` / `git pull` もこの認証で可能
- ブラウザで GitHub にログインし、表示されたコードを入力

### 3. API リクエストの実行

```bash
# メタ情報（Octocat）の取得
gh api /octocat --method GET

# リポジトリの Issue 一覧（例: octocat/Spoon-Knife）
gh api /repos/octocat/Spoon-Knife/issues --method GET

# 自分のユーザー情報
gh api /user --method GET
```

---

## 方法2: curl

トークンを使った認証が必要です。

### 1. Personal Access Token (PAT) の作成

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. **repo** スコープにチェック → トークンを生成し、控える

### 2. リクエスト例

```bash
# 認証なし（公開エンドポイントのみ・レート制限あり）
curl --request GET \
  --url "https://api.github.com/octocat" \
  --header "Accept: application/vnd.github+json"

# 認証あり（YOUR-TOKEN を PAT に置き換え）
curl --request GET \
  --url "https://api.github.com/repos/octocat/Spoon-Knife/issues" \
  --header "Accept: application/vnd.github+json" \
  --header "Authorization: Bearer YOUR-TOKEN"
```

環境変数でトークンを渡す場合:

```bash
export GITHUB_TOKEN="your_token_here"
curl --request GET \
  --url "https://api.github.com/user" \
  --header "Accept: application/vnd.github+json" \
  --header "Authorization: Bearer $GITHUB_TOKEN"
```

---

## 方法3: Octokit.js（JavaScript / Node.js）

スクリプトやアプリから REST API を呼ぶ場合に便利です。

### 1. トークン作成

上記「方法2」と同様に PAT を作成。

### 2. セットアップ

```bash
npm init -y
npm install octokit
```

### 3. 使用例

```javascript
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
  owner: "octocat",
  repo: "Spoon-Knife",
});
console.log(data);
```

トークンは環境変数 `GITHUB_TOKEN` で渡し、リポジトリにコミットしないでください。

---

## このリポジトリでの実行

- **公開エンドポイントの動作確認:**  
  `scripts/github-api-quickstart.sh` を実行すると、認証なしで `GET /octocat` を呼びます。
- **認証付きの確認:**  
  `GITHUB_TOKEN` または `GH_TOKEN` を設定したうえで同じスクリプトを実行すると、認証付きのエンドポイント（例: レート制限）も試せます。

```bash
# 認証なし
./scripts/github-api-quickstart.sh

# 認証あり（PAT を設定してから実行）
export GITHUB_TOKEN="ghp_xxxx"
./scripts/github-api-quickstart.sh
```

---

## 参考リンク

- [Quickstart for GitHub REST API](https://docs.github.com/en/rest/quickstart)
- [Getting started with the REST API](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api)
- [Authenticating to the REST API](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)
