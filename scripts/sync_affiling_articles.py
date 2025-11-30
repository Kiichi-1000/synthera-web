import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Cloudflare Images統合
sys.path.insert(0, str(Path(__file__).parent))
from utils.cloudflare_images import upload_image_from_url


NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

AFFILING_ARTICLE_DATA: List[Dict] = [
    {
        "title": "【2024年版】おすすめノートPC比較ランキング TOP5",
        "excerpt": "実際に使用したノートPCを徹底比較。価格、性能、使いやすさを総合評価した完全ガイドです。",
        "category": "ranking",
        "date": "2024-01-15",
        "image": None,
        "readTime": 12,
        "productCount": 5,
        "content": "ノートPC選びは、用途や予算によって最適な選択が大きく変わります。今回は、実際に使用した5機種を徹底比較し、2024年時点でのおすすめランキングを作成しました。\n\n比較したノートPCの選定基準\n今回の比較では、以下の基準で評価を行いました：\n性能：CPU、メモリ、ストレージのスペック\n使いやすさ：キーボード、タッチパッド、画面の見やすさ\n価格対性能：コストパフォーマンス\nデザイン：見た目、重量、持ち運びやすさ\nサポート：保証期間、サポート体制\n\n第5位：ASUS ZenBook 14\nASUS ZenBook 14は、バランスの取れた中価格帯ノートPCです。AMD Ryzen 7プロセッサーを搭載し、日常的な作業から軽めのクリエイティブ作業まで対応できます。\n\n評価ポイント：\n価格：約12万円（コストパフォーマンス優秀）\n性能：★★★★☆（日常作業には十分）\nデザイン：★★★★☆（シンプルで洗練されたデザイン）\nバッテリー：約10時間（長時間使用可能）\n\n第4位：Lenovo ThinkPad X1 Carbon\nビジネスユーザーに人気のThinkPad X1 Carbon。堅牢性とキーボードの打ち心地が評価されています。\n\n評価ポイント：\n価格：約18万円（ビジネス向け）\n性能：★★★★★（ビジネス用途に最適）\nキーボード：★★★★★（最高クラスの打ち心地）\n堅牢性：★★★★★（軍用規格準拠）\n\n第3位：Dell XPS 13\nDell XPS 13は、薄型軽量でありながら高性能を実現したプレミアムノートPCです。インフィニティエッジディスプレイが印象的です。\n\n評価ポイント：\n価格：約15万円（プレミアムモデル）\n性能：★★★★★（最新CPUで快適）\n画面：★★★★★（4Kオプションあり）\nデザイン：★★★★★（非常に洗練されたデザイン）\n\n第2位：MacBook Air M3\nAppleのM3チップを搭載したMacBook Air。パフォーマンスとバッテリー寿命の両立が素晴らしいです。\n\n評価ポイント：\n価格：約15万円（M3モデル）\n性能：★★★★★（M3チップの性能は圧倒的）\nバッテリー：★★★★★（最大18時間）\nデザイン：★★★★★（Appleの洗練されたデザイン）\nOS：macOS（Windowsユーザーには移行が必要）\n\n第1位：MacBook Pro 14インチ M3 Pro\n総合評価で第1位に選んだのは、MacBook Pro 14インチ M3 Proです。クリエイティブ作業から開発作業まで、あらゆる用途に対応できる高性能ノートPCです。\n\n評価ポイント：\n価格：約28万円（高価格帯）\n性能：★★★★★（M3 Proチップで最高クラス）\n画面：★★★★★（Liquid Retina XDRディスプレイ）\nバッテリー：★★★★★（最大18時間）\nサウンド：★★★★★（6スピーカーシステム）\n\n用途別おすすめ\n日常的な作業・Web閲覧\nASUS ZenBook 14がコストパフォーマンスに優れています。約12万円で十分な性能を提供します。\n\nビジネス用途\nLenovo ThinkPad X1 Carbonが最適です。堅牢性とキーボードの打ち心地がビジネスユーザーに好評です。\n\nクリエイティブ作業・開発\nMacBook Pro 14インチ M3 Proが最強です。高性能と優れた画面、長時間のバッテリーが魅力です。\n\nまとめ\nノートPC選びは、予算と用途を明確にすることが重要です。今回比較した5機種は、それぞれ異なる強みを持っています。自分の使用目的に合わせて、最適な1台を選んでください。\n\n特に、MacBook Pro 14インチ M3 Proは、価格は高めですが、長期的に使用することを考えると投資価値のある選択肢だと思います。",
        "status": "Published",
        "tags": ["ノートPC", "ランキング", "おすすめ"],
    }
]

ROOT_PAGE_NAME = "synthera database"
DATABASE_NAME = "Affiling Articles Manager"
DEFAULT_EXPORT_PATH = Path("data/affiling_articles.json")


def get_env_value(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        print(f"[ERROR] 環境変数 {key} が設定されていません。", file=sys.stderr)
        sys.exit(1)
    return value


def notion_request(method: str, path: str, token: str, payload: Optional[Dict]) -> Dict:
    url = f"{NOTION_API_BASE}{path}"
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url=url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Notion-Version", NOTION_VERSION)
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
            print(error_body, file=sys.stderr)
        sys.exit(1)


def notion_search(token: str, query: str, object_type: str) -> List[Dict]:
    payload = {"query": query, "filter": {"value": object_type, "property": "object"}}
    response = notion_request("POST", "/search", token, payload)
    return response.get("results", [])


def _resolve_root_page(token: str) -> Optional[str]:
    page_results = notion_search(token, ROOT_PAGE_NAME, "page")
    for page in page_results:
        title_prop = page.get("properties", {}).get("title", {}).get("title", [])
        if title_prop and title_prop[0].get("plain_text", "") == ROOT_PAGE_NAME:
            return page["id"]
    return None


def ensure_database(token: str) -> Tuple[str, bool]:
    database_results = notion_search(token, DATABASE_NAME, "database")
    for result in database_results:
        title_property = result.get("title", [])
        if title_property and title_property[0].get("plain_text", "") == DATABASE_NAME:
            return result["id"].replace("-", ""), False

    parent_page_id = _resolve_root_page(token)
    if not parent_page_id:
        print(f"[ERROR] '{ROOT_PAGE_NAME}' ページが見つからず、データベースを作成できませんでした。", file=sys.stderr)
        sys.exit(1)

    database_payload = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "title": [{"type": "text", "text": {"content": DATABASE_NAME}}],
        "properties": {
            "Title": {"title": {}},
            "Excerpt": {"rich_text": {}},
            "Category": {
                "select": {
                    "options": [
                        {"name": "comparison", "color": "blue"},
                        {"name": "ranking", "color": "green"},
                        {"name": "review", "color": "yellow"},
                        {"name": "guide", "color": "purple"},
                    ]
                }
            },
            "Date": {"date": {}},
            "Image": {"files": {}},
            "Read Time": {"number": {}},
            "Product Count": {"number": {}},
            "Content": {"rich_text": {}},
            "Status": {
                "select": {
                    "options": [
                        {"name": "Draft", "color": "yellow"},
                        {"name": "Published", "color": "green"},
                        {"name": "Archived", "color": "gray"},
                    ]
                }
            },
            "Tags": {"multi_select": {}},
        },
    }

    created_database = notion_request("POST", "/databases", token, database_payload)
    return created_database["id"].replace("-", ""), True


def fetch_existing_pages(database_id: str, token: str) -> Dict[str, Dict]:
    existing_pages: Dict[str, Dict] = {}
    cursor = None

    while True:
        payload = {}
        if cursor:
            payload["start_cursor"] = cursor
        response = notion_request("POST", f"/databases/{database_id}/query", token, payload)

        for page in response.get("results", []):
            properties = page.get("properties", {})
            title_prop = properties.get("Title", {})
            title = ""
            title_items = title_prop.get("title", [])
            if title_items:
                title = title_items[0].get("plain_text", "").strip()

            if title:
                existing_pages[title] = page

        next_cursor = response.get("next_cursor")
        if not next_cursor:
            break
        cursor = next_cursor

    return existing_pages


def extract_rich_text(rich_text_prop: Dict) -> str:
    text_items = rich_text_prop.get("rich_text", [])
    return "".join(item.get("plain_text", "") for item in text_items)


def fetch_page_blocks(page_id: str, token: str) -> List[Dict]:
    """Notionページのブロックを再帰的に取得"""
    blocks = []
    cursor = None
    
    while True:
        # GETリクエストなので、パラメータをURLに含める
        path = f"/blocks/{page_id}/children"
        if cursor:
            path += f"?start_cursor={cursor}"
        
        response = notion_request("GET", path, token, None)
        results = response.get("results", [])
        blocks.extend(results)
        
        next_cursor = response.get("next_cursor")
        if not next_cursor:
            break
        cursor = next_cursor
    
    return blocks


def rich_text_to_html(rich_text: List[Dict]) -> str:
    """Notion rich_textをHTMLに変換（リンク、スタイルなどを処理）"""
    html_parts = []
    for item in rich_text:
        text = item.get("plain_text", "")
        if not text:
            continue
        
        annotations = item.get("annotations", {})
        # リンク情報を取得（複数の場所をチェック）
        link = None
        if item.get("type") == "text":
            link = item.get("text", {}).get("link")
        if not link:
            link = item.get("href")  # hrefプロパティにもリンクがある場合
        
        # テキストをエスケープ
        import html
        escaped_text = html.escape(text)
        
        # スタイルを適用（ネストできるように順序を調整）
        styled_text = escaped_text
        if annotations.get("bold"):
            styled_text = f"<strong>{styled_text}</strong>"
        if annotations.get("italic"):
            styled_text = f"<em>{styled_text}</em>"
        if annotations.get("code"):
            styled_text = f"<code>{escaped_text}</code>"
        if annotations.get("underline"):
            styled_text = f"<u>{styled_text}</u>"
        if annotations.get("strikethrough"):
            styled_text = f"<s>{styled_text}</s>"
        
        # リンクを処理（最後に適用）
        if link:
            url = None
            if isinstance(link, dict) and link.get("url"):
                url = link.get("url")
            elif isinstance(link, str):
                url = link
            if url:
                styled_text = f'<a href="{html.escape(url)}" target="_blank" rel="nofollow noopener">{styled_text}</a>'
        
        text = styled_text
        
        html_parts.append(text)
    
    return "".join(html_parts)


def blocks_to_html(blocks: List[Dict], token: str) -> str:
    """NotionブロックをHTMLに変換"""
    html_parts = []
    i = 0
    
    while i < len(blocks):
        block = blocks[i]
        block_type = block.get("type", "")
        block_data = block.get(block_type, {})
        
        if block_type == "paragraph":
            rich_text = block_data.get("rich_text", [])
            text = rich_text_to_html(rich_text)
            if text.strip():
                html_parts.append(f"<p>{text}</p>")
        
        elif block_type == "heading_1":
            rich_text = block_data.get("rich_text", [])
            text = rich_text_to_html(rich_text)
            if text.strip():
                html_parts.append(f"<h1>{text}</h1>")
        
        elif block_type == "heading_2":
            rich_text = block_data.get("rich_text", [])
            text = rich_text_to_html(rich_text)
            if text.strip():
                html_parts.append(f"<h2>{text}</h2>")
        
        elif block_type == "heading_3":
            rich_text = block_data.get("rich_text", [])
            text = rich_text_to_html(rich_text)
            if text.strip():
                html_parts.append(f"<h3>{text}</h3>")
        
        elif block_type == "bulleted_list_item":
            # 連続するbulleted_list_itemを1つの<ul>にまとめる
            list_items = []
            j = i
            while j < len(blocks) and blocks[j].get("type") == "bulleted_list_item":
                item_data = blocks[j].get("bulleted_list_item", {})
                rich_text = item_data.get("rich_text", [])
                text = rich_text_to_html(rich_text)
                if text.strip():
                    list_items.append(f"<li>{text}</li>")
                j += 1
            if list_items:
                html_parts.append(f"<ul>{''.join(list_items)}</ul>")
            i = j - 1  # ループでiがインクリメントされるので-1
        
        elif block_type == "numbered_list_item":
            # 連続するnumbered_list_itemを1つの<ol>にまとめる
            list_items = []
            j = i
            while j < len(blocks) and blocks[j].get("type") == "numbered_list_item":
                item_data = blocks[j].get("numbered_list_item", {})
                rich_text = item_data.get("rich_text", [])
                text = rich_text_to_html(rich_text)
                if text.strip():
                    list_items.append(f"<li>{text}</li>")
                j += 1
            if list_items:
                html_parts.append(f"<ol>{''.join(list_items)}</ol>")
            i = j - 1  # ループでiがインクリメントされるので-1
        
        elif block_type == "image":
            image_data = block_data.get("file") or block_data.get("external")
            if image_data:
                url = image_data.get("url", "")
                caption = block_data.get("caption", [])
                caption_text = "".join(item.get("plain_text", "") for item in caption)
                if url:
                    html_parts.append(f'<img src="{url}" alt="{caption_text}">')
        
        elif block_type == "code":
            # コードブロックを処理（HTMLコードブロックの場合はそのまま出力）
            rich_text = block_data.get("rich_text", [])
            code_text = "".join(item.get("plain_text", "") for item in rich_text)
            if code_text.strip():
                language = block_data.get("language", "")
                # HTML/XMLコードブロックの場合はエスケープしない（そのまま出力）
                if language in ["html", "xml"]:
                    if language:
                        html_parts.append(f'<pre><code class="language-{language}">{code_text}</code></pre>')
                    else:
                        html_parts.append(f'<pre><code>{code_text}</code></pre>')
                else:
                    # その他の言語はエスケープ
                    import html
                    escaped_code = html.escape(code_text)
                    if language:
                        html_parts.append(f'<pre><code class="language-{language}">{escaped_code}</code></pre>')
                    else:
                        html_parts.append(f'<pre><code>{escaped_code}</code></pre>')
        
        elif block_type == "callout":
            rich_text = block_data.get("rich_text", [])
            text = rich_text_to_html(rich_text)
            if text.strip():
                html_parts.append(f"<div class='callout'><p>{text}</p></div>")
        
        elif block_type == "divider":
            html_parts.append("<hr>")
        
        elif block_type == "table_of_contents":
            # 目次はスキップ
            pass
        
        # 子ブロックを再帰的に処理
        has_children = block.get("has_children", False)
        if has_children:
            child_block_id = block.get("id", "")
            child_blocks = fetch_page_blocks(child_block_id, token)
            child_html = blocks_to_html(child_blocks, token)
            if child_html:
                html_parts.append(child_html)
        
        i += 1
    
    return "\n".join(html_parts)


def extract_date(date_prop: Dict) -> Optional[str]:
    date_obj = date_prop.get("date")
    if not date_obj:
        return None
    return date_obj.get("start")


def extract_number(number_prop: Dict) -> Optional[int]:
    return number_prop.get("number")


def extract_files(files_prop: Dict) -> Optional[str]:
    files = files_prop.get("files", [])
    if not files:
        return None
    file_obj = files[0]
    file_type = file_obj.get("type")
    if file_type == "external":
        return file_obj.get("external", {}).get("url")
    elif file_type == "file":
        return file_obj.get("file", {}).get("url")
    return None


def extract_select(select_prop: Dict) -> Optional[str]:
    select_obj = select_prop.get("select")
    if not select_obj:
        return None
    return select_obj.get("name")


def extract_multi_select(multi_select_prop: Dict) -> List[str]:
    multi_select_obj = multi_select_prop.get("multi_select", [])
    return [item.get("name", "") for item in multi_select_obj]


def build_property_payload(title: str, data: Dict) -> Dict:
    payload: Dict = {}

    # Title
    payload["Title"] = {"title": [{"text": {"content": title}}]}

    # Excerpt
    excerpt = data.get("excerpt", "")
    if excerpt:
        payload["Excerpt"] = {"rich_text": [{"text": {"content": excerpt}}]}

    # Category
    category = data.get("category")
    if category:
        payload["Category"] = {"select": {"name": category}}

    # Date
    date = data.get("date")
    if date:
        payload["Date"] = {"date": {"start": date}}

    # Image
    image = data.get("image")
    if image:
        if image.startswith("http://") or image.startswith("https://"):
            payload["Image"] = {"files": [{"name": "Article Image", "type": "external", "external": {"url": image}}]}
        else:
            payload["Image"] = {"files": [{"name": "Article Image", "type": "file", "file": {"url": image}}]}

    # Read Time
    read_time = data.get("readTime")
    if read_time is not None:
        payload["Read Time"] = {"number": read_time}

    # Product Count
    product_count = data.get("productCount")
    if product_count is not None:
        payload["Product Count"] = {"number": product_count}

    # Content
    content = data.get("content", "")
    if content:
        # Remove HTML tags for plain text (Notion rich_text doesn't support HTML)
        import re
        plain_content = re.sub(r"<[^>]+>", "", content)
        payload["Content"] = {"rich_text": [{"text": {"content": plain_content}}]}

    # Status
    status = data.get("status", "Published")
    payload["Status"] = {"select": {"name": status}}

    # Tags
    tags = data.get("tags", [])
    if tags:
        payload["Tags"] = {"multi_select": [{"name": tag} for tag in tags]}

    return payload


def pull_from_notion(database_id: str, token: str, output_path: Path):
    articles = []
    cursor = None

    while True:
        payload = {}
        if cursor:
            payload["start_cursor"] = cursor

        # Filter for Published articles only
        payload["filter"] = {
            "property": "Status",
            "select": {"equals": "Published"},
        }

        response = notion_request("POST", f"/databases/{database_id}/query", token, payload)

        for page in response.get("results", []):
            properties = page.get("properties", {})
            page_id = page["id"].replace("-", "")

            title_prop = properties.get("Title", {})
            title_items = title_prop.get("title", [])
            title = title_items[0].get("plain_text", "") if title_items else ""

            if not title:
                continue

            excerpt = extract_rich_text(properties.get("Excerpt", {}))
            category = extract_select(properties.get("Category", {}))
            date = extract_date(properties.get("Date", {}))
            image = extract_files(properties.get("Image", {}))
            
            # 画像をCloudflare Imagesにアップロード（一時URLの場合は永続URLに変換）
            if image:
                try:
                    permanent_image_url = upload_image_from_url(image, image_id=f"affiling-{page_id}")
                    if permanent_image_url:
                        image = permanent_image_url
                except Exception as e:
                    # 画像アップロードに失敗しても処理を継続
                    print(f"[WARNING] 画像アップロードに失敗しました（記事: {title}）: {e}", file=sys.stderr)
                    # 元のURLを使用して継続
            
            read_time = extract_number(properties.get("Read Time", {}))
            product_count = extract_number(properties.get("Product Count", {}))
            content = extract_rich_text(properties.get("Content", {}))
            
            # Contentプロパティが空の場合は、ページの本文（ブロック）から取得
            if not content or not content.strip():
                try:
                    page_blocks = fetch_page_blocks(page["id"], token)
                    content = blocks_to_html(page_blocks, token)
                    if content:
                        print(f"[INFO] ページ本文から記事内容を取得しました: {title[:50]}...", file=sys.stderr)
                except Exception as e:
                    print(f"[WARNING] ページ本文の取得に失敗しました（記事: {title[:50]}...）: {e}", file=sys.stderr)
            
            tags = extract_multi_select(properties.get("Tags", {}))

            article = {
                "id": page_id,
                "title": title,
                "excerpt": excerpt,
                "category": category or "guide",
                "date": date or "",
                "image": image,
                "readTime": read_time or 0,
                "productCount": product_count,
                "content": content,
                "tags": tags,
            }

            articles.append(article)

        next_cursor = response.get("next_cursor")
        if not next_cursor:
            break
        cursor = next_cursor

    # Sort by date (newest first)
    articles.sort(key=lambda x: x.get("date", ""), reverse=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(articles, fp, ensure_ascii=False, indent=2)

    print(f"✅ {len(articles)}件の記事を {output_path} にエクスポートしました。")


def push_to_notion(database_id: str, token: str, archive_existing: bool):
    existing_pages = fetch_existing_pages(database_id, token)

    if archive_existing:
        for title, page in existing_pages.items():
            page_id = page["id"].replace("-", "")
            notion_request(
                "PATCH",
                f"/pages/{page_id}",
                token,
                {"properties": {"Status": {"select": {"name": "Archived"}}}},
            )
        print(f"✅ 既存の{len(existing_pages)}件をアーカイブしました。")
        existing_pages = {}

    created_count = 0
    updated_count = 0

    for article in AFFILING_ARTICLE_DATA:
        title = article.get("title", "").strip()
        if not title:
            continue

        payload = build_property_payload(title, article)

        if title in existing_pages:
            page_id = existing_pages[title]["id"].replace("-", "")
            notion_request("PATCH", f"/pages/{page_id}", token, {"properties": payload})
            updated_count += 1
            print(f"✅ 更新: {title}")
        else:
            notion_request(
                "POST",
                "/pages",
                token,
                {
                    "parent": {"type": "database_id", "database_id": database_id},
                    "properties": payload,
                },
            )
            created_count += 1
            print(f"✅ 作成: {title}")

    print(f"\n✅ 完了: {created_count}件作成、{updated_count}件更新")


# 統一インターフェース関数（管理者ページ用）
def export_notion_to_json(token: str, output_path: Path) -> Dict[str, int]:
    """管理者ページ用の統一インターフェース関数"""
    try:
        database_id, _ = ensure_database(token)
        pull_from_notion(database_id, token, output_path)
        # ファイルから件数を取得
        if output_path.exists():
            with output_path.open("r", encoding="utf-8") as fp:
                data = json.load(fp)
                count = len(data) if isinstance(data, list) else 0
                return {"notion_count": count, "file": str(output_path)}
        return {"notion_count": 0, "file": str(output_path)}
    except Exception as e:
        print(f"[ERROR] Affiling記事のエクスポートに失敗しました: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        raise


def sync_to_notion(token: str, reset: bool = False) -> None:
    """管理者ページ用の統一インターフェース関数"""
    database_id, created = ensure_database(token)
    if created:
        print(f"[CREATE] Notion データベース '{DATABASE_NAME}' を作成しました。")
    else:
        print(f"[INFO] 既存データベース '{DATABASE_NAME}' を使用します。")
    push_to_notion(database_id, token, archive_existing=reset)


def main():
    parser = argparse.ArgumentParser(description="Affiling Articles Notion同期スクリプト")
    parser.add_argument("action", choices=["pull", "push"], help="pull: Notion→JSON, push: JSON→Notion")
    parser.add_argument("--archive", action="store_true", help="push時に既存の記事をアーカイブ")
    parser.add_argument("--output", type=Path, default=DEFAULT_EXPORT_PATH, help="出力パス（pull時）")
    args = parser.parse_args()

    token = get_env_value("NOTION_API_TOKEN")
    database_id, created = ensure_database(token)

    if created:
        print(f"✅ データベース '{DATABASE_NAME}' を作成しました。")
        print(f"⚠️  データベースID: {database_id}")
        print(f"⚠️  データベースをインテグレーションに共有してください。")

    if args.action == "pull":
        pull_from_notion(database_id, token, args.output)
    elif args.action == "push":
        push_to_notion(database_id, token, args.archive)


if __name__ == "__main__":
    main()

