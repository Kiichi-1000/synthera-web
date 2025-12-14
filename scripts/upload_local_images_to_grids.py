#!/usr/bin/env python3
"""ローカルの画像ファイルをCloudflare Imagesにアップロードしてグリッドに追加"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils.cloudflare_images import upload_to_cloudflare_images

# ファイル名からグリッド名へのマッピング
FILENAME_TO_GRID = {
    "affiling.jpg": "Affiling",
    "AI小人.jpeg": "AI小人",
    "era.cast.jpg": "EraCast",
    "Etsy_logo.svg.png": "This is Japanese Quality",  # 推測
    "Jpan.GIF": "This is Japanese Quality",
}

def upload_local_image(image_path: Path, image_id: str) -> str:
    """ローカル画像ファイルをCloudflare Imagesにアップロード"""
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        permanent_url = upload_to_cloudflare_images(image_data, image_id=image_id)
        if permanent_url:
            print(f"    ✅ アップロード成功: {permanent_url[:80]}...")
            return permanent_url
        else:
            print(f"    ❌ アップロード失敗")
            return None
    except Exception as e:
        print(f"    ❌ エラー: {e}")
        return None

def update_grids_with_local_images(json_path: Path, image_dir: Path):
    """ローカル画像をCloudflare Imagesにアップロードしてグリッドを更新"""
    
    # JSONファイルを読み込み
    with open(json_path, 'r', encoding='utf-8') as f:
        grids = json.load(f)
    
    print(f"グリッド数: {len(grids)}")
    print(f"画像ディレクトリ: {image_dir}")
    print()
    
    # グリッドを名前でインデックス
    grids_by_name = {grid['grid_name']: grid for grid in grids}
    
    # 画像ディレクトリ内のファイルを確認
    image_files = list(image_dir.glob("*.*"))
    image_files = [f for f in image_files if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']]
    
    if not image_files:
        print("❌ 画像ファイルが見つかりませんでした")
        return
    
    print(f"見つかった画像ファイル: {len(image_files)}個")
    print()
    
    updated_count = 0
    
    for image_file in image_files:
        filename = image_file.name
        print(f"処理中: {filename}")
        
        # ファイル名からグリッド名を推測
        grid_name = FILENAME_TO_GRID.get(filename)
        
        if not grid_name:
            # ファイル名から推測（拡張子を除いた名前でマッチ）
            base_name = image_file.stem.lower()
            for grid in grids:
                if grid['grid_name'].lower() in base_name or base_name in grid['grid_name'].lower():
                    grid_name = grid['grid_name']
                    break
        
        if not grid_name:
            print(f"  ⚠️ 対応するグリッドが見つかりません。スキップします")
            continue
        
        print(f"  → グリッド: {grid_name}")
        
        if grid_name not in grids_by_name:
            print(f"  ⚠️ グリッド '{grid_name}' がJSONファイルに存在しません。スキップします")
            continue
        
        grid = grids_by_name[grid_name]
        
        # 画像IDを生成
        image_id = f"grid-{grid_name.lower().replace(' ', '-')}-{image_file.stem}"
        
        # Cloudflare Imagesにアップロード
        permanent_url = upload_local_image(image_file, image_id)
        
        if permanent_url:
            # グリッドのgrid_imageに追加（既に同じファイル名があれば更新、なければ追加）
            grid_images = grid.get('grid_image', [])
            
            # 同じファイル名の画像を探す
            updated = False
            for img in grid_images:
                if img.get('name') == filename:
                    img['url'] = permanent_url
                    updated = True
                    print(f"  ✅ 画像URLを更新しました")
                    break
            
            if not updated:
                # 新規追加
                grid_images.append({
                    "name": filename,
                    "url": permanent_url
                })
                grid['grid_image'] = grid_images
                print(f"  ✅ 画像を追加しました")
            
            updated_count += 1
        
        print()
    
    # JSONファイルを保存
    if updated_count > 0:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(grids, f, ensure_ascii=False, indent=2)
        print(f"✅ {updated_count}個の画像をアップロードし、グリッドを更新しました")
        print(f"📁 JSONファイルを保存しました: {json_path}")
    else:
        print("ℹ️ 更新された画像はありませんでした")
    
    return updated_count


if __name__ == "__main__":
    # 環境変数を確認
    if not os.environ.get("CLOUDFLARE_IMAGES_ACCOUNT_ID") or not os.environ.get("CLOUDFLARE_IMAGES_API_TOKEN"):
        print("❌ 環境変数 CLOUDFLARE_IMAGES_ACCOUNT_ID と CLOUDFLARE_IMAGES_API_TOKEN を設定してください", file=sys.stderr)
        sys.exit(1)
    
    project_root = Path(__file__).parent.parent
    json_path = project_root / "data" / "sns_grids.json"
    image_dir = project_root / "image"
    
    if not json_path.exists():
        print(f"❌ JSONファイルが見つかりません: {json_path}", file=sys.stderr)
        sys.exit(1)
    
    if not image_dir.exists():
        print(f"❌ 画像ディレクトリが見つかりません: {image_dir}", file=sys.stderr)
        sys.exit(1)
    
    updated_count = update_grids_with_local_images(json_path, image_dir)
    sys.exit(0 if updated_count > 0 else 1)

