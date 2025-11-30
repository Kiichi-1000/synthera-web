#!/usr/bin/env python3
"""
Notionデータベースの設定を確認するスクリプト
使用方法: python3 scripts/check_notion_database.py
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

def check_database():
    token = get_env_var("NOTION_API_TOKEN")
    
    # データベースを検索
    sys.path.insert(0, 'scripts')
    import sync_affiling_articles as aff
    db_id, _ = aff.ensure_database(token)
    
    print(f"\n{'='*60}")
    print("Notionデータベース設定確認")
    print(f"{'='*60}\n")
    print(f"データベースID: {db_id}\n")
    
    # データベース情報を取得
    db_info = notion_request("GET", f"/databases/{db_id}", token, None)
    
    print("=== データベースプロパティ ===\n")
    props = db_info.get("properties", {})
    required_props = {
        "Title": "title",
        "Status": "select",
        "Content": "rich_text",
        "Excerpt": "rich_text",
        "Category": "select",
        "Date": "date",
        "Image": "files",
        "Read Time": "number",
        "Product Count": "number",
        "Tags": "multi_select",
    }
    
    missing_props = []
    for prop_name, expected_type in required_props.items():
        if prop_name in props:
            prop_type = props[prop_name].get("type", "")
            status = "✅" if prop_type == expected_type else "⚠️"
            print(f"{status} {prop_name}: {prop_type}")
            if prop_type != expected_type:
                print(f"   → 期待されるタイプ: {expected_type}")
        else:
            print(f"❌ {prop_name}: 存在しません")
            missing_props.append(prop_name)
    
    print()
    
    # Statusプロパティの選択肢を確認
    if "Status" in props:
        status_options = props["Status"].get("select", {}).get("options", [])
        print("=== Statusプロパティの選択肢 ===")
        required_statuses = ["Draft", "Published", "Archived"]
        for status in required_statuses:
            found = any(opt.get("name") == status for opt in status_options)
            print(f"{'✅' if found else '❌'} {status}")
        print()
    
    # 記事を確認
    print("=== 記事一覧 ===\n")
    query_payload = {}
    response = notion_request("POST", f"/databases/{db_id}/query", token, query_payload)
    pages = response.get("results", [])
    
    print(f"合計 {len(pages)}件の記事が見つかりました\n")
    
    for page in pages:
        props = page.get("properties", {})
        title = props.get("Title", {}).get("title", [{}])[0].get("plain_text", "タイトルなし")
        status_obj = props.get("Status", {}).get("select")
        status = status_obj.get("name") if status_obj else "なし"
        content_prop = props.get("Content", {}).get("rich_text", [])
        content_text = "".join([item.get("plain_text", "") for item in content_prop])
        
        print(f"📄 {title}")
        print(f"   Status: {status}")
        print(f"   Contentプロパティ: {len(content_text)}文字")
        print(f"   ページID: {page.get('id', 'unknown')}")
        
        # ページのブロック数を確認
        try:
            page_blocks = aff.fetch_page_blocks(page["id"], token)
            block_count = len(page_blocks)
            print(f"   ページブロック数: {block_count}個")
            if block_count > 0:
                print(f"   ✅ ページ本文に内容があります")
            else:
                print(f"   ⚠️ ページ本文が空です")
        except Exception as e:
            print(f"   ❌ ページブロックの取得に失敗: {e}")
        
        print()
    
    # まとめ
    print(f"{'='*60}")
    print("確認結果のまとめ\n")
    
    if missing_props:
        print(f"❌ 不足しているプロパティ: {', '.join(missing_props)}")
    else:
        print("✅ すべての必須プロパティが存在します")
    
    published_count = 0
    for page in pages:
        status_obj = page.get("properties", {}).get("Status", {}).get("select")
        if status_obj and status_obj.get("name") == "Published":
            published_count += 1
    print(f"\n公開中の記事: {published_count}件")
    
    pages_with_content = 0
    for page in pages:
        try:
            blocks = aff.fetch_page_blocks(page["id"], token)
            if len(blocks) > 0:
                pages_with_content += 1
        except:
            pass
    
    print(f"ページ本文に内容がある記事: {pages_with_content}件")
    
    print(f"\n{'='*60}")

if __name__ == "__main__":
    check_database()

