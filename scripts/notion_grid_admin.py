import json
import os
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Dict, Iterable, List, Tuple
from urllib.parse import parse_qs

import sync_notion_grids as sns_sync
import sync_writing_articles as writing_sync
import sync_note_articles as note_sync
import sync_ec_projects as ec_sync
import sync_app_development as dev_sync
import sync_affiling_articles as affiling_sync


HOST = "127.0.0.1"
PORT = 8765


@dataclass(frozen=True)
class DatasetConfig:
    key: str
    label: str
    description: str
    module: object
    static_attr: str
    notes: Tuple[str, ...] = ()


DATASET_CONFIGS: List[DatasetConfig] = [
    DatasetConfig(
        key="sns",
        label="SNS Project Grid",
        description="Projects ページの SNS タブに表示されるグリッド情報を管理します。",
        module=sns_sync,
        static_attr="SNS_GRID_DATA",
        notes=(
            "画像は Notion の \"Grid Image\" プロパティにアップロード/URL指定できます。",
        ),
    ),
    DatasetConfig(
        key="writing",
        label="Writing Articles",
        description="Projects ページの 個人ライティング タブに表示される記事カードを管理します。",
        module=writing_sync,
        static_attr="WRITING_DATA",
        notes=(
            "リンク先は \"CTA Link\"、ボタン文言は \"CTA Label\" で設定します。",
        ),
    ),
    DatasetConfig(
        key="note",
        label="Note Articles",
        description="Note ページの記事カードを管理します。",
        module=note_sync,
        static_attr="NOTE_DATA",
        notes=(
            "カテゴリは technology / business / creative / lifestyle / news のいずれかを設定。",
            "公開日は \"Publish Date\"、画像は \"Cover Image\" で管理します。",
        ),
    ),
    DatasetConfig(
        key="dev",
        label="App Development Grid",
        description="Projects ページの アプリ開発 タブに表示されるカード情報を管理します。",
        module=dev_sync,
        static_attr="APP_PROJECT_DATA",
        notes=(
            "画像が不要なためプレースホルダー表示のままです。",
        ),
    ),
    DatasetConfig(
        key="ec",
        label="EC Projects",
        description="Projects ページの EC タブに表示されるカード情報を管理します。",
        module=ec_sync,
        static_attr="EC_DATA",
        notes=(
            "商品画像は \"Project Image\" に外部URLまたはファイルで追加できます。",
        ),
    ),
    DatasetConfig(
        key="affiling",
        label="Affiling Articles",
        description="Affiling ページの記事を管理します。記事一覧、サイドバー、詳細ページに表示されます。",
        module=affiling_sync,
        static_attr="AFFILING_ARTICLE_DATA",
        notes=(
            "カテゴリは comparison / ranking / review / guide のいずれかを設定。",
            "公開日は \"Date\"、画像は \"Image\"、読了時間は \"Read Time\" で管理します。",
            "本文は \"Content\" に記述。HTMLタグは自動的に削除されます。",
            "タグは \"Tags\" で複数設定可能です。",
        ),
    ),
]


def get_env_value(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise RuntimeError(f"環境変数 {key} が設定されていません。")
    return value


def load_local_json(path: Path) -> List[Dict]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def get_static_dataset_length(config: DatasetConfig) -> int:
    module = config.module
    if hasattr(module, config.static_attr):
        records = getattr(module, config.static_attr)
        if isinstance(records, Iterable):
            return len(list(records))
    return 0


def ensure_dataset_status(token: str, config: DatasetConfig) -> Dict:
    module = config.module
    database_id, _ = module.ensure_database(token)
    notion_records = module.fetch_existing_pages(database_id, token)
    local_records = load_local_json(module.DEFAULT_EXPORT_PATH)
    return {
        "key": config.key,
        "label": config.label,
        "description": config.description,
        "database_id": database_id,
        "notion_count": len(notion_records),
        "local_count": len(local_records),
        "static_count": get_static_dataset_length(config),
        "export_path": str(module.DEFAULT_EXPORT_PATH),
        "notes": list(config.notes),
    }


def perform_pull(token: str, configs: Iterable[DatasetConfig]) -> None:
    for config in configs:
        module = config.module
        module.export_notion_to_json(token, module.DEFAULT_EXPORT_PATH)


def perform_push(token: str, configs: Iterable[DatasetConfig], reset: bool) -> None:
    for config in configs:
        module = config.module
        module.sync_to_notion(token, reset=reset)


class AdminHandler(BaseHTTPRequestHandler):
    token: str = ""
    datasets: Dict[str, DatasetConfig] = {cfg.key: cfg for cfg in DATASET_CONFIGS}

    def do_GET(self):
        if self.path in ("/", "/admin"):
            self.render_admin_page()
        elif self.path == "/status":
            self.render_status_json()
        else:
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        params = parse_qs(body)

        action = params.get("action", [""])[0]
        dataset_key = params.get("dataset", [""])[0]
        reset = params.get("reset", ["off"])[0] == "on"

        if action not in {"pull", "push"}:
            self.send_error(HTTPStatus.BAD_REQUEST, "Unsupported action")
            return

        try:
            if dataset_key == "all":
                configs = self.datasets.values()
            else:
                configs = [self.datasets[dataset_key]]
        except KeyError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Unknown dataset")
            return

        if action == "pull":
            perform_pull(self.token, configs)
        elif action == "push":
            perform_push(self.token, configs, reset=reset)

        self.redirect("/")

    # -- helpers ---------------------------------------------------------
    def render_status_json(self):
        payload = [ensure_dataset_status(self.token, cfg) for cfg in DATASET_CONFIGS]
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def render_admin_page(self):
        statuses = [ensure_dataset_status(self.token, cfg) for cfg in DATASET_CONFIGS]

        sections_html = ""
        for status in statuses:
            notes_html = ""
            if status["notes"]:
                notes_html = "    <ul class=\"notes\">\n" + "\n".join(f"      <li>{note}</li>" for note in status["notes"]) + "\n    </ul>\n"

            sections_html += f"""
  <section class="card">
    <header>
      <h2>{status["label"]}</h2>
      <p>{status["description"]}</p>
{notes_html if notes_html else ""}
    </header>
    <dl>
      <dt>Notion Database ID</dt>
      <dd>{status["database_id"]}</dd>
      <dt>Notion 上のレコード数</dt>
      <dd>{status["notion_count"]} 件</dd>
      <dt>静的データセット</dt>
      <dd>{status["static_count"]} 件</dd>
      <dt>ローカル JSON</dt>
      <dd>{status["local_count"]} 件 ({status["export_path"]})</dd>
    </dl>
    <div class="actions">
      <form method="post" action="/action">
        <input type="hidden" name="action" value="pull">
        <input type="hidden" name="dataset" value="{status["key"]}">
        <button type="submit">Notion からローカル JSON を更新</button>
      </form>
      <form method="post" action="/action">
        <input type="hidden" name="action" value="push">
        <input type="hidden" name="dataset" value="{status["key"]}">
        <button type="submit">静的データを Notion に同期</button>
        <label>
          <input type="checkbox" name="reset">
          同期前に既存レコードをアーカイブ
        </label>
      </form>
    </div>
  </section>
"""

        html = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Synthera Project Admin</title>
  <style>
    body {{
      margin: 0;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #050505;
      color: #f5f5f5;
    }}
    h1 {{
      margin-bottom: 24px;
      font-size: 28px;
    }}
    .grid {{
      display: grid;
      gap: 24px;
    }}
    .toolbar {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 32px;
      padding: 18px 24px;
      border-radius: 16px;
      border: 1px solid #1d1d1d;
      background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(10,10,10,0.9));
    }}
    .toolbar form {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }}
    button {{
      background: #00d4ff;
      color: #03131a;
      border: none;
      border-radius: 999px;
      padding: 10px 20px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }}
    button:hover {{
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.25);
    }}
    label {{
      font-size: 13px;
      color: #c8c8c8;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .card {{
      border-radius: 20px;
      padding: 24px;
      border: 1px solid #1b1b1b;
      background: rgba(12, 12, 12, 0.95);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    }}
    .card header h2 {{
      margin: 0;
      font-size: 20px;
    }}
    .card header p {{
      margin: 6px 0 18px;
      color: #b5b5b5;
      font-size: 14px;
      line-height: 1.6;
    }}
    .notes {{
      margin: 0 0 16px;
      padding-left: 20px;
      color: #9fdcff;
      font-size: 13px;
      line-height: 1.6;
    }}
    .notes li {{
      list-style: disc;
    }}
    dl {{
      margin: 0 0 18px;
      display: grid;
      grid-template-columns: 200px 1fr;
      row-gap: 10px;
    }}
    dt {{
      font-weight: 600;
      color: #7ddaff;
    }}
    dd {{
      margin: 0;
      color: #dfdfdf;
    }}
    .actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }}
    .actions form {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }}
  </style>
</head>
<body>
  <h1>Synthera Project Admin</h1>
  <div class="toolbar">
    <form method="post" action="/action">
      <input type="hidden" name="action" value="pull">
      <input type="hidden" name="dataset" value="all">
      <button type="submit">すべてのデータセットを Notion から取得</button>
    </form>
    <form method="post" action="/action">
      <input type="hidden" name="action" value="push">
      <input type="hidden" name="dataset" value="all">
      <button type="submit">すべてのデータセットを Notion へ同期</button>
      <label>
        <input type="checkbox" name="reset">
        同期前に既存レコードをアーカイブ
      </label>
    </form>
  </div>
  <div class="grid">
{sections_html}
  </div>
</body>
</html>"""
        encoded = html.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def redirect(self, location: str):
        self.send_response(HTTPStatus.SEE_OTHER)
        self.send_header("Location", location)
        self.end_headers()


def run_server():
    token = get_env_value("NOTION_API_TOKEN")
    AdminHandler.token = token

    with HTTPServer((HOST, PORT), AdminHandler) as httpd:
        print(f"[ADMIN] ブラウザで http://{HOST}:{PORT}/ を開いてください。Ctrl+C で終了します。")
        httpd.serve_forever()


if __name__ == "__main__":
    run_server()

