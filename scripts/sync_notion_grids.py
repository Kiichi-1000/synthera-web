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

SNS_GRID_DATA: List[Dict[str, str]] = [
    {
        "grid_name": "Affiling",
        "project": "Affiling",
        "platform": "Web",
        "detail_text": "商品比較やランキングなどの記事を作成するWebサイトを運営。実際に使用した製品を誠実に紹介しています。",
        "cta_link": "https://synthera.jp/affiling",
        "status": "Published",
    },
    {
        "grid_name": "EraCast",
        "project": "EraCast",
        "platform": "YouTube",
        "detail_text": "世界のトレンド（Fortnite、MBTI など）を分析し、現実や未来を読み解く動画コンテンツを制作・投稿しています。",
        "cta_link": "https://synthera.jp/eracast",
        "status": "Published",
    },
    {
        "grid_name": "AI小人",
        "project": "AI小人",
        "platform": "YouTube",
        "detail_text": "AI 動画生成技術を活用し、小人が人間の生活空間で様々な活動（パルクール、鬼ごっこ、ドッヂボールなど）をする様子を動画化しています。",
        "cta_link": "",
        "status": "Published",
    },
    {
        "grid_name": "This is Japanese Quality",
        "project": "Other",
        "platform": "Web",
        "detail_text": "日本の優良商品を世界に紹介し、日本製品の良さを伝えるコンテンツを制作しています。",
        "cta_link": "",
        "status": "Published",
    },
]

ROOT_PAGE_NAME = "synthera database"
DATABASE_NAME = "SNS Project Grid Manager"
DEFAULT_EXPORT_PATH = Path("data/sns_grids.json")


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
    payload = {
        "query": query,
        "filter": {"value": object_type, "property": "object"},
    }
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
            "Grid Name": {"title": {}},
            "Project": {
                "select": {
                    "options": [
                        {"name": "Affiling", "color": "pink"},
                        {"name": "EraCast", "color": "blue"},
                        {"name": "AI小人", "color": "orange"},
                        {"name": "NovaTV", "color": "green"},
                        {"name": "Other", "color": "gray"},
                    ]
                }
            },
            "Platform": {
                "select": {
                    "options": [
                        {"name": "YouTube", "color": "red"},
                        {"name": "TikTok", "color": "purple"},
                        {"name": "Instagram", "color": "yellow"},
                        {"name": "Web", "color": "brown"},
                        {"name": "Other", "color": "gray"},
                    ]
                }
            },
            "Grid Image": {"files": {}},
            "Detail Text": {"rich_text": {}},
            "CTA Link": {"url": {}},
            "Status": {
                "select": {
                    "options": [
                        {"name": "Draft", "color": "yellow"},
                        {"name": "Published", "color": "green"},
                        {"name": "Archived", "color": "gray"},
                    ]
                }
            },
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
            title_prop = properties.get("Grid Name", {})
            title = ""
            title_items = title_prop.get("title", [])
            if title_items:
                title = title_items[0].get("plain_text", "").strip()

            if title:
                existing_pages[title] = page

        if not response.get("has_more"):
            break

        cursor = response.get("next_cursor")
        if not cursor:
            break

    return existing_pages


def build_property_payload(entry: Dict[str, str]) -> Dict:
    def select_or_none(value: str):
        return {"name": value} if value else None

    def rich_text_value(text: str):
        return [{"type": "text", "text": {"content": text}}] if text else []

    url_value = entry.get("cta_link") or None

    return {
        "Grid Name": {"title": [{"type": "text", "text": {"content": entry["grid_name"]}}]},
        "Project": {"select": select_or_none(entry.get("project", ""))},
        "Platform": {"select": select_or_none(entry.get("platform", ""))},
        "Detail Text": {"rich_text": rich_text_value(entry.get("detail_text", ""))},
        "CTA Link": {"url": url_value},
        "Status": {"select": select_or_none(entry.get("status", ""))},
    }


def delete_all_pages(database_id: str, token: str) -> int:
    existing_pages = fetch_existing_pages(database_id, token)
    count = 0
    for page in existing_pages.values():
        page_id = page["id"]
        notion_request("PATCH", f"/pages/{page_id}", token, {"archived": True})
        count += 1
    return count


def upsert_pages(database_id: str, token: str, data: List[Dict[str, str]]) -> Tuple[int, int]:
    existing_pages = fetch_existing_pages(database_id, token)
    created = 0
    updated = 0

    for entry in data:
        properties = build_property_payload(entry)
        grid_name = entry["grid_name"]

        if grid_name in existing_pages:
            page_id = existing_pages[grid_name]["id"]
            notion_request("PATCH", f"/pages/{page_id}", token, {"properties": properties, "archived": False})
            updated += 1
            print(f"[UPDATE] {grid_name}")
        else:
            payload = {"parent": {"database_id": database_id}, "properties": properties}
            notion_request("POST", "/pages", token, payload)
            created += 1
            print(f"[CREATE] {grid_name}")

    return created, updated


def sync_to_notion(token: str, reset: bool = False) -> None:
    database_id, created = ensure_database(token)
    if created:
        print(f"[CREATE] Notion データベース '{DATABASE_NAME}' を作成しました。")
    else:
        print(f"[INFO] 既存データベース '{DATABASE_NAME}' を使用します。")

    if reset:
        deleted = delete_all_pages(database_id, token)
        print(f"[RESET] 既存レコード {deleted} 件をアーカイブしました。")

    created_count, updated_count = upsert_pages(database_id, token, SNS_GRID_DATA)
    print(f"[DONE] {created_count} 件を新規作成、{updated_count} 件を更新しました。")


def notion_page_to_dict(page: Dict) -> Dict[str, Optional[str]]:
    props = page.get("properties", {})

    def get_title(prop_name: str) -> str:
        items = props.get(prop_name, {}).get("title", [])
        return items[0].get("plain_text", "").strip() if items else ""

    def get_select(prop_name: str) -> str:
        select = props.get(prop_name, {}).get("select")
        if isinstance(select, dict):
            return select.get("name", "")
        return ""

    def get_rich_text(prop_name: str) -> str:
        texts = props.get(prop_name, {}).get("rich_text", [])
        return "".join(item.get("plain_text", "") for item in texts).strip()

    def get_url(prop_name: str) -> str:
        return props.get(prop_name, {}).get("url") or ""

    def get_files(prop_name: str) -> List[Dict[str, str]]:
        files = props.get(prop_name, {}).get("files", [])
        normalized = []
        for file_obj in files:
            original_url = None
            file_name = file_obj.get("name", "")
            
            if file_obj.get("type") == "external":
                original_url = file_obj.get("external", {}).get("url", "")
            elif file_obj.get("type") == "file":
                original_url = file_obj.get("file", {}).get("url", "")
            
            if original_url:
                # Cloudflare Imagesにアップロード（一時URLの場合は永続URLに変換）
                try:
                    page_id = page.get("id", "").replace("-", "")[:16]
                    permanent_url = upload_image_from_url(original_url, image_id=f"grid-{page_id}-{file_name}")
                    normalized.append({"name": file_name, "url": permanent_url if permanent_url else original_url})
                except Exception as e:
                    # アップロードに失敗した場合は元のURLを使用
                    print(f"[WARNING] グリッド画像のアップロードに失敗しました（{file_name}）: {e}", file=sys.stderr)
                    normalized.append({"name": file_name, "url": original_url})
        
        return normalized

    return {
        "grid_name": get_title("Grid Name"),
        "project": get_select("Project"),
        "platform": get_select("Platform"),
        "detail_text": get_rich_text("Detail Text"),
        "cta_link": get_url("CTA Link"),
        "status": get_select("Status"),
        "grid_image": get_files("Grid Image"),
    }


def export_notion_to_json(token: str, output_path: Path) -> Dict[str, int]:
    database_id, _ = ensure_database(token)
    existing = fetch_existing_pages(database_id, token)
    records = [notion_page_to_dict(page) for page in existing.values()]
    records.sort(key=lambda item: item["grid_name"])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(records, fp, ensure_ascii=False, indent=2)

    return {"notion_count": len(records), "file": str(output_path)}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="SNS グリッドと Notion データベースの同期ユーティリティ")
    subparsers = parser.add_subparsers(dest="command", required=True)

    push_parser = subparsers.add_parser("push", help="静的データを Notion に同期します。")
    push_parser.add_argument("--reset", action="store_true", help="同期前に既存レコードをアーカイブします。")

    pull_parser = subparsers.add_parser("pull", help="Notion の内容を JSON ファイルとしてエクスポートします。")
    pull_parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_EXPORT_PATH,
        help=f"エクスポート先のパス（既定: {DEFAULT_EXPORT_PATH}）",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    token = get_env_value("NOTION_API_TOKEN")

    if args.command == "push":
        sync_to_notion(token, reset=args.reset)
    elif args.command == "pull":
        result = export_notion_to_json(token, args.output)
        print(f"[EXPORT] Notion から {result['notion_count']} 件を取得し、{result['file']} に保存しました。")


if __name__ == "__main__":
    main()

