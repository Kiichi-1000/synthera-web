import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

EC_DATA: List[Dict[str, str]] = [
    {
        "project_name": "Etsyショップ",
        "description": "海外に向けて日本の製品を販売しています。日本人らしいものを世界に届ける活動です。",
        "cta_label": "ショップを見る",
        "cta_link": "https://syntherastore.etsy.com",
        "status": "Published",
        "image_url": "",
    },
    {
        "project_name": "アパレルブランド",
        "description": "オリジナルブランドの構築に取り組んでいます。プロトタイプ開発と市場検証を進行中です。",
        "cta_label": "",
        "cta_link": "",
        "status": "Published",
        "image_url": "",
    },
]

ROOT_PAGE_NAME = "EC Operations"
DATABASE_NAME = "EC Projects Manager"
DEFAULT_EXPORT_PATH = Path("data/ec_projects.json")


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
            "Project Name": {"title": {}},
            "Description": {"rich_text": {}},
            "Project Image": {"files": {}},
            "CTA Label": {"rich_text": {}},
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
            title_prop = properties.get("Project Name", {})
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
    def rich_text_value(text: str):
        return [{"type": "text", "text": {"content": text}}] if text else []

    properties = {
        "Project Name": {"title": [{"type": "text", "text": {"content": entry["project_name"]}}]},
        "Description": {"rich_text": rich_text_value(entry.get("description", ""))},
        "CTA Label": {"rich_text": rich_text_value(entry.get("cta_label", ""))},
        "CTA Link": {"url": entry.get("cta_link") or None},
        "Status": {"select": {"name": entry.get("status", "Published")}},
    }

    files: List[Dict[str, Dict[str, str]]] = []
    image_url = entry.get("image_url")
    if image_url:
        files.append(
            {
                "type": "external",
                "external": {"url": image_url},
                "name": entry["project_name"],
            }
        )

    if files:
        properties["Project Image"] = {"files": files}

    return properties


def delete_all_pages(database_id: str, token: str) -> int:
    existing_pages = fetch_existing_pages(database_id, token)
    count = 0
    for page in existing_pages.values():
        page_id = page["id"]
        notion_request("PATCH", f"/pages/{page_id}", token, {"archived": True})
        count += 1
    return count


def upsert_pages(database_id: str, token: str, data: Iterable[Dict[str, str]]) -> Tuple[int, int]:
    existing_pages = fetch_existing_pages(database_id, token)
    created = 0
    updated = 0

    for entry in data:
        properties = build_property_payload(entry)
        project_name = entry["project_name"]

        if project_name in existing_pages:
            page_id = existing_pages[project_name]["id"]
            notion_request("PATCH", f"/pages/{page_id}", token, {"properties": properties, "archived": False})
            updated += 1
            print(f"[UPDATE] {project_name}")
        else:
            payload = {"parent": {"database_id": database_id}, "properties": properties}
            notion_request("POST", "/pages", token, payload)
            created += 1
            print(f"[CREATE] {project_name}")

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

    created_count, updated_count = upsert_pages(database_id, token, EC_DATA)
    print(f"[DONE] {created_count} 件を新規作成、{updated_count} 件を更新しました。")


def notion_page_to_dict(page: Dict) -> Dict[str, Optional[str]]:
    props = page.get("properties", {})

    def get_title(prop_name: str) -> str:
        items = props.get(prop_name, {}).get("title", [])
        return items[0].get("plain_text", "").strip() if items else ""

    def get_rich_text(prop_name: str) -> str:
        texts = props.get(prop_name, {}).get("rich_text", [])
        return "".join(item.get("plain_text", "") for item in texts).strip()

    def get_files(prop_name: str) -> List[Dict[str, str]]:
        files = props.get(prop_name, {}).get("files", [])
        normalized: List[Dict[str, str]] = []
        for file_obj in files:
            if file_obj.get("type") == "external":
                normalized.append(
                    {
                        "name": file_obj.get("name", ""),
                        "url": file_obj.get("external", {}).get("url", ""),
                    }
                )
            elif file_obj.get("type") == "file":
                normalized.append(
                    {
                        "name": file_obj.get("name", ""),
                        "url": file_obj.get("file", {}).get("url", ""),
                    }
                )
        return normalized

    def get_url(prop_name: str) -> str:
        return props.get(prop_name, {}).get("url") or ""

    def get_select(prop_name: str) -> str:
        select = props.get(prop_name, {}).get("select")
        if isinstance(select, dict):
            return select.get("name", "")
        return ""

    return {
        "project_name": get_title("Project Name"),
        "description": get_rich_text("Description"),
        "cta_label": get_rich_text("CTA Label"),
        "cta_link": get_url("CTA Link"),
        "status": get_select("Status"),
        "project_image": get_files("Project Image"),
    }


def export_notion_to_json(token: str, output_path: Path) -> Dict[str, int]:
    database_id, _ = ensure_database(token)
    existing = fetch_existing_pages(database_id, token)
    records = [notion_page_to_dict(page) for page in existing.values()]
    records = [record for record in records if record.get("status") != "Archived"]
    records.sort(key=lambda item: item["project_name"])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(records, fp, ensure_ascii=False, indent=2)

    return {"notion_count": len(records), "file": str(output_path)}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="EC プロジェクトと Notion データベースの同期ユーティリティ")
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

