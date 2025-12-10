#!/usr/bin/env python3
"""
記事内容の保存場所を確認するスクリプト
使用方法: python3 scripts/check_article_content_location.py
"""

import os
import sys
import json
import urllib.request
import urllib.error

NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

def get_env_var(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"[ERROR] 環境変数 {name} が設定されていません。", file=sys.stderr)
        sys.exit(1)
    return value

def notion_request(method: str, path: str, token: str, payload=None):
    url = f"{NOTION_API_BASE}{path}"
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url=url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Notion-Version", NOTION_VERSION)
    if data:
        req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode("utf-8")
            if not body:
                return {}
            return json.loads(body)
    except urllib.error.HTTPError as error:
        error_body = error.read().decode("utf-8")
        print(f"[ERROR] Notion API 呼び出しに失敗しました: {error.code} {error.reason}", file=sys.stderr)
        if error_body:
            try:
                error_data = json.loads(error_body)
                print(f"[ERROR] エラー詳細: {error_data}", file=sys.stderr)
            except:
                print(f"[ERROR] エラーレスポンス: {error_body}", file=sys.stderr)
        sys.exit(1)

def check_content_location():
    token = get_env_var("NOTION_API_TOKEN")
    
    # データベースを検索
    sys.path.insert(0, 'scripts')
    import sync_affiling_articles as aff
    db_id, _ = aff.ensure_database(token)
    
    print(f"\n{'='*60}")
    print("記事内容の保存場所を確認")
    print(f"{'='*60}\n")
    print(f"データベースID: {db_id}\n")
    
    # 記事を取得
    query_payload = {
        "filter": {
            "property": "Status",
            "select": {"equals": "Published"}
        }
    }
    response = notion_request("POST", f"/databases/{db_id}/query", token, query_payload)
    pages = response.get("results", [])
    
    print(f"公開中の記事: {len(pages)}件\n")
    
    for page in pages:
        props = page.get("properties", {})
        title = props.get("Title", {}).get("title", [{}])[0].get("plain_text", "タイトルなし")
        page_id = page.get("id", "")
        
        print(f"📄 {title}")
        print(f"   ページID: {page_id}")
        
        # Commentプロパティを確認
        comment_prop = props.get("Comment", {})
        comment_text = ""
        if comment_prop:
            rich_text = comment_prop.get("rich_text", [])
            comment_text = "".join([item.get("plain_text", "") for item in rich_text])
        
        # Contentプロパティを確認
        content_prop = props.get("Content", {})
        content_text = ""
        if content_prop:
            rich_text = content_prop.get("rich_text", [])
            content_text = "".join([item.get("plain_text", "") for item in rich_text])
        
        # ページ本文（ブロック）を確認
        page_blocks = []
        try:
            page_blocks = aff.fetch_page_blocks(page_id, token)
        except Exception as e:
            print(f"   ❌ ページブロックの取得に失敗: {e}")
        
        # 結果を表示
        print(f"\n   各場所の記事内容:")
        print(f"   - Commentプロパティ: {len(comment_text)}文字")
        if comment_text:
            print(f"      先頭50文字: {comment_text[:50]}...")
        
        print(f"   - Contentプロパティ: {len(content_text)}文字")
        if content_text:
            print(f"      先頭50文字: {content_text[:50]}...")
        
        print(f"   - ページ本文（ブロック）: {len(page_blocks)}個のブロック")
        if page_blocks:
            # ブロックからテキストを抽出して表示
            try:
                blocks_html = aff.blocks_to_html(page_blocks, token)
                blocks_text = blocks_html[:200] if blocks_html else ""
                print(f"      先頭200文字: {blocks_text}...")
                print(f"      ✅ ページ本文に内容があります")
            except Exception as e:
                print(f"      ⚠️ ブロック変換エラー: {e}")
        else:
            print(f"      ⚠️ ページ本文が空です")
        
        # どの場所に記事内容があるか判定
        print(f"\n   📍 記事内容の場所:")
        if page_blocks and len(page_blocks) > 0:
            print(f"      ✅ ページ本文（ブロック）に記事内容があります")
        elif comment_text:
            print(f"      ✅ Commentプロパティに記事内容があります")
        elif content_text:
            print(f"      ✅ Contentプロパティに記事内容があります")
        else:
            print(f"      ⚠️ 記事内容が見つかりませんでした")
        
        print()
    
    print(f"{'='*60}")

if __name__ == "__main__":
    check_content_location()

