#!/usr/bin/env python3
"""単一の画像URLをCloudflare Imagesにアップロード"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils.cloudflare_images import upload_image_from_url

def main():
    if len(sys.argv) < 2:
        print("使用方法: python3 upload_single_image.py <画像URL> [画像ID]")
        sys.exit(1)
    
    image_url = sys.argv[1]
    image_id = sys.argv[2] if len(sys.argv) > 2 else "affiling-manual-upload"
    
    # 環境変数を確認
    if not os.environ.get("CLOUDFLARE_IMAGES_ACCOUNT_ID") or not os.environ.get("CLOUDFLARE_IMAGES_API_TOKEN"):
        print("❌ 環境変数 CLOUDFLARE_IMAGES_ACCOUNT_ID と CLOUDFLARE_IMAGES_API_TOKEN を設定してください", file=sys.stderr)
        sys.exit(1)
    
    print(f"画像URL: {image_url[:100]}...")
    print(f"画像ID: {image_id}")
    print("Cloudflare Imagesにアップロード中...")
    print()
    
    permanent_url = upload_image_from_url(image_url, image_id=image_id)
    
    if permanent_url:
        print(f"✅ アップロード成功!")
        print(f"永続URL: {permanent_url}")
        print()
        print("このURLを記事のHTMLコンテンツに使用できます:")
        print(f'<img src="{permanent_url}" alt="画像">')
    else:
        print(f"❌ アップロード失敗")
        sys.exit(1)


if __name__ == "__main__":
    main()

