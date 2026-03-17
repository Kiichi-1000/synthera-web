#!/usr/bin/env bash
# GitHub REST API クイックスタート実行スクリプト
# docs: https://docs.github.com/en/rest/quickstart

set -e

API_BASE="https://api.github.com"
ACCEPT="Accept: application/vnd.github+json"

echo "=== GitHub REST API Quickstart ==="
echo ""

# 1. 認証なし: 公開エンドポイント GET /octocat
echo "1. GET /octocat (public, no auth)"
echo "---"
curl -s --request GET \
  --url "${API_BASE}/octocat" \
  --header "$ACCEPT"
echo ""
echo ""

# 2. 認証あり: トークンが設定されていればレート制限を取得
TOKEN="${GITHUB_TOKEN:-$GH_TOKEN}"
if [ -n "$TOKEN" ]; then
  echo "2. GET /rate_limit (authenticated)"
  echo "---"
  curl -s --request GET \
    --url "${API_BASE}/rate_limit" \
    --header "$ACCEPT" \
    --header "Authorization: Bearer $TOKEN" | head -c 500
  echo ""
  echo ""
  echo "3. GET /user (authenticated)"
  echo "---"
  curl -s --request GET \
    --url "${API_BASE}/user" \
    --header "$ACCEPT" \
    --header "Authorization: Bearer $TOKEN" | head -c 300
  echo ""
else
  echo "2. (skipped) Set GITHUB_TOKEN or GH_TOKEN to test authenticated endpoints."
  echo "   Example: export GITHUB_TOKEN=ghp_xxxx && $0"
fi

echo ""
echo "Done."
