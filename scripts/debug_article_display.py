#!/usr/bin/env python3
"""
記事表示の問題をデバッグするスクリプト
Notionからフロントエンドまで全てを確認します
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

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
        return None

def debug_all():
    print("="*60)
    print("記事表示問題のデバッグ")
    print("="*60)
    print()
    
    # 1. 環境変数の確認
    print("1. 環境変数の確認")
    print("-"*60)
    token = os.environ.get("NOTION_API_TOKEN")
    if token:
        print(f"✅ NOTION_API_TOKEN: {token[:30]}...")
    else:
        print("❌ NOTION_API_TOKEN: 未設定")
        return
    
    # 2. Notionデータベースの確認
    print("\n2. Notionデータベースの確認")
    print("-"*60)
    sys.path.insert(0, 'scripts')
    import sync_affiling_articles as aff
    db_id, _ = aff.ensure_database(token)
    print(f"データベースID: {db_id}")
    
    query_payload = {
        "filter": {
            "property": "Status",
            "select": {"equals": "Published"}
        }
    }
    response = notion_request("POST", f"/databases/{db_id}/query", token, query_payload)
    if not response:
        print("❌ データベースのクエリに失敗しました")
        return
    
    pages = response.get("results", [])
    print(f"公開中の記事: {len(pages)}件\n")
    
    for page in pages:
        props = page.get("properties", {})
        title = props.get("Title", {}).get("title", [{}])[0].get("plain_text", "タイトルなし")
        status_obj = props.get("Status", {}).get("select")
        status = status_obj.get("name") if status_obj else "なし"
        
        print(f"📄 {title}")
        print(f"   Status: {status}")
        print(f"   ページID: {page.get('id', 'unknown')}")
        
        # ページ本文を確認
        try:
            blocks = aff.fetch_page_blocks(page["id"], token)
            print(f"   ページブロック数: {len(blocks)}個")
            if len(blocks) > 0:
                html_content = aff.blocks_to_html(blocks, token)
                print(f"   ✅ ページ本文からHTMLを生成: {len(html_content)}文字")
            else:
                print(f"   ⚠️ ページ本文が空です")
        except Exception as e:
            print(f"   ❌ ページブロックの取得に失敗: {e}")
        print()
    
    # 3. JSONファイルの確認
    print("3. JSONファイルの確認")
    print("-"*60)
    json_path = Path("data/affiling_articles.json")
    if json_path.exists():
        print(f"✅ JSONファイルが存在します: {json_path}")
        file_size = json_path.stat().st_size
        print(f"   ファイルサイズ: {file_size}バイト")
        
        with open(json_path, 'r', encoding='utf-8') as f:
            articles = json.load(f)
            print(f"   記事数: {len(articles)}件\n")
            
            for i, article in enumerate(articles, 1):
                print(f"   記事{i}:")
                print(f"     ID: {article.get('id', 'なし')}")
                print(f"     タイトル: {article.get('title', 'なし')}")
                print(f"     カテゴリ: {article.get('category', 'なし')}")
                print(f"     コンテンツ長さ: {len(article.get('content', ''))}文字")
                if not article.get('content'):
                    print(f"     ⚠️ コンテンツが空です")
                print()
    else:
        print(f"❌ JSONファイルが存在しません: {json_path}")
    
    # 4. HTMLファイルの確認
    print("4. HTMLファイルの確認")
    print("-"*60)
    html_path = Path("affiling.html")
    if html_path.exists():
        print(f"✅ HTMLファイルが存在します: {html_path}")
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
            # 必要な要素が存在するか確認
            checks = {
                'loading-state': 'loading-state' in html_content,
                'articles-grid': 'articles-grid' in html_content,
                'affiling.js': 'affiling.js' in html_content,
                'skeleton-card': 'skeleton-card' in html_content,
            }
            
            for check, result in checks.items():
                status = "✅" if result else "❌"
                print(f"   {status} {check}")
    else:
        print(f"❌ HTMLファイルが存在しません: {html_path}")
    
    # 5. JavaScriptファイルの確認
    print("\n5. JavaScriptファイルの確認")
    print("-"*60)
    js_path = Path("js/affiling.js")
    if js_path.exists():
        print(f"✅ JavaScriptファイルが存在します: {js_path}")
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            
            checks = {
                'loadArticles': 'function loadArticles' in js_content,
                'renderArticles': 'function renderArticles' in js_content,
                'showLoadingState': 'function showLoadingState' in js_content,
                'hideLoadingState': 'function hideLoadingState' in js_content,
                'fetch.*affiling_articles.json': 'affiling_articles.json' in js_content,
            }
            
            for check, result in checks.items():
                status = "✅" if result else "❌"
                print(f"   {status} {check}")
    else:
        print(f"❌ JavaScriptファイルが存在しません: {js_path}")
    
    # まとめ
    print("\n" + "="*60)
    print("まとめ")
    print("="*60)
    print(f"- Notion記事数: {len(pages)}件")
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            articles = json.load(f)
            print(f"- JSON記事数: {len(articles)}件")
            content_count = sum(1 for a in articles if a.get('content'))
            print(f"- コンテンツあり: {content_count}件")
            empty_count = len(articles) - content_count
            if empty_count > 0:
                print(f"- ⚠️ コンテンツなし: {empty_count}件")

if __name__ == "__main__":
    debug_all()

