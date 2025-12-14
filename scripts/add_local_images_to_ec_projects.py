#!/usr/bin/env python3
"""ローカルの画像ファイルをec_projects.jsonに追加"""
import json
import sys
from pathlib import Path

# ファイル名からプロジェクト名へのマッピング
FILENAME_TO_PROJECT = {
    "synthera.brand.png": "アパレルブランド",
    "synthera-brand.png": "アパレルブランド",
    "brand.png": "アパレルブランド",
}

def update_ec_projects_with_local_images(json_path: Path, image_dir: Path):
    """ローカル画像をec_projects.jsonに追加（相対パスで保存）"""
    
    # JSONファイルを読み込み
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)
    
    print(f"プロジェクト数: {len(projects)}")
    print(f"画像ディレクトリ: {image_dir}")
    print()
    
    # プロジェクトを名前でインデックス
    projects_by_name = {project['project_name']: project for project in projects}
    
    # 対象画像ファイルを確認（ブランド関連のファイルを検索）
    target_keywords = ["brand", "ブランド", "synthera"]
    image_files = []
    
    for img_file in image_dir.iterdir():
        if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.svg']:
            filename_lower = img_file.name.lower()
            # 既に処理済みのファイル（todo, calendar, etc.）はスキップ
            if filename_lower in ['todo.jpg', 'calender.jpg', 'calendar.jpg', 'affiling.jpg', 'era.cast.jpg', 'ai小人.jpeg', 'jpan.gif', 'etsy_logo.svg.png']:
                continue
            # ブランド関連のキーワードが含まれるファイルを対象
            if any(keyword.lower() in filename_lower for keyword in target_keywords):
                image_files.append(img_file)
    
    if not image_files:
        print("❌ 対象の画像ファイルが見つかりませんでした")
        return 0
    
    print(f"見つかった画像ファイル: {len(image_files)}個")
    print()
    
    updated_count = 0
    
    for image_file in image_files:
        filename = image_file.name
        print(f"処理中: {filename}")
        
        # ファイル名からプロジェクト名を推測
        project_name = FILENAME_TO_PROJECT.get(filename)
        
        if not project_name:
            # ファイル名から推測（拡張子を除いた名前でマッチ）
            base_name = image_file.stem.lower()
            for project in projects:
                project_name_lower = project['project_name'].lower()
                if "brand" in base_name or "ブランド" in base_name:
                    if "ブランド" in project_name_lower or "brand" in project_name_lower:
                        project_name = project['project_name']
                        break
                elif "synthera" in base_name:
                    if "アパレル" in project_name_lower or "ブランド" in project_name_lower:
                        project_name = project['project_name']
                        break
        
        if not project_name:
            print(f"  ⚠️ 対応するプロジェクトが見つかりません。スキップします")
            continue
        
        print(f"  → プロジェクト: {project_name}")
        
        if project_name not in projects_by_name:
            print(f"  ⚠️ プロジェクト '{project_name}' がJSONファイルに存在しません。スキップします")
            continue
        
        project = projects_by_name[project_name]
        
        # 相対パスを生成（image/から始まるパス）
        relative_path = f"image/{filename}"
        
        # プロジェクトのproject_imageに追加（既に同じファイル名があれば更新、なければ追加）
        project_images = project.get('project_image', [])
        
        # 同じファイル名の画像を探す
        updated = False
        for img in project_images:
            if img.get('name') == filename:
                # 既存の画像をローカルパスで更新
                img['url'] = relative_path
                updated = True
                print(f"  ✅ 画像URLをローカルパスに更新: {relative_path}")
                break
        
        if not updated:
            # 新規追加
            project_images.append({
                "name": filename,
                "url": relative_path
            })
            project['project_image'] = project_images
            print(f"  ✅ 画像を追加: {relative_path}")
        
        updated_count += 1
        print()
    
    # JSONファイルを保存
    if updated_count > 0:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(projects, f, ensure_ascii=False, indent=2)
        print(f"✅ {updated_count}個の画像をプロジェクトに追加しました")
        print(f"📁 JSONファイルを保存しました: {json_path}")
    else:
        print("ℹ️ 更新された画像はありませんでした")
    
    return updated_count


if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    json_path = project_root / "data" / "ec_projects.json"
    image_dir = project_root / "image"
    
    if not json_path.exists():
        print(f"❌ JSONファイルが見つかりません: {json_path}", file=sys.stderr)
        sys.exit(1)
    
    if not image_dir.exists():
        print(f"❌ 画像ディレクトリが見つかりません: {image_dir}", file=sys.stderr)
        sys.exit(1)
    
    updated_count = update_ec_projects_with_local_images(json_path, image_dir)
    sys.exit(0 if updated_count > 0 else 1)

