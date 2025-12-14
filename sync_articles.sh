#!/bin/bash
# 記事同期スクリプト
# 環境変数を設定して記事同期を実行します

# 注意: APIトークンは環境変数として設定してください
# 例: export NOTION_API_TOKEN="your_token_here"
#     export CLOUDFLARE_IMAGES_ACCOUNT_ID="your_account_id_here"
#     export CLOUDFLARE_IMAGES_API_TOKEN="your_token_here"

# 環境変数が設定されているか確認
if [ -z "$NOTION_API_TOKEN" ]; then
    echo "❌ エラー: NOTION_API_TOKEN が設定されていません"
    echo "環境変数を設定してから再実行してください"
    exit 1
fi

if [ -z "$CLOUDFLARE_IMAGES_ACCOUNT_ID" ]; then
    echo "❌ エラー: CLOUDFLARE_IMAGES_ACCOUNT_ID が設定されていません"
    echo "環境変数を設定してから再実行してください"
    exit 1
fi

if [ -z "$CLOUDFLARE_IMAGES_API_TOKEN" ]; then
    echo "❌ エラー: CLOUDFLARE_IMAGES_API_TOKEN が設定されていません"
    echo "環境変数を設定してから再実行してください"
    exit 1
fi

echo "✅ 環境変数が設定されています"
echo "   - Notion API Token: ${NOTION_API_TOKEN:0:30}..."
echo "   - Cloudflare Account ID: $CLOUDFLARE_IMAGES_ACCOUNT_ID"
echo ""

cd "$(dirname "$0")"
python3 scripts/sync_affiling_articles.py pull --output data/affiling_articles.json
