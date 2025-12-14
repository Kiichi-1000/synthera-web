#!/usr/bin/env python3
"""記事内のNotion一時URL画像をCloudflare ImagesにアップロードしてJSONファイルを更新"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils.cloudflare_images import upload_image_from_url, is_permanent_url

def find_and_upload_images(json_path: Path):
    """JSONファイル内の画像URLを検索してCloudflare Imagesにアップロード"""
    
    # JSONファイルを読み込み
    with open(json_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)
    
    print(f"記事数: {len(articles)}")
    print()
    
    updated_count = 0
    upload_count = 0
    
    for article_idx, article in enumerate(articles):
        title = article.get('title', '')
        content = article.get('content', '')
        
        if not content:
            continue
        
        # 画像タグからURLを抽出
        img_tags = re.findall(r'<img[^>]+>', content)
        if not img_tags:
            continue
        
        print(f"記事: {title[:50]}...")
        print(f"  画像タグ数: {len(img_tags)}")
        
        new_content = content
        article_updated = False
        
        for img_tag in img_tags:
            url_match = re.search(r'src=["\']([^"\']+)["\']', img_tag)
            if not url_match:
                continue
            
            original_url = url_match.group(1)
            
            # 既にCloudflare ImagesのURLの場合はスキップ
            if is_permanent_url(original_url) and ('imagedelivery.net' in original_url or 'cloudflare.com' in original_url):
                print(f"    ✅ 既にCloudflare Images: {original_url[:80]}...")
                continue
            
            # Notionの一時URLの場合はアップロード
            if not is_permanent_url(original_url):
                print(f"    ⚠️ Notion一時URLを検出: {original_url[:100]}...")
                
                try:
                    # 画像IDを生成
                    page_id = article.get('id', '')[:16] if article.get('id') else f'article-{article_idx}'
                    image_id = f"affiling-{page_id}-img"
                    
                    # Cloudflare Imagesにアップロード
                    permanent_url = upload_image_from_url(original_url, image_id=image_id)
                    
                    if permanent_url and permanent_url != original_url:
                        print(f"    ✅ アップロード成功: {permanent_url[:80]}...")
                        # URLを置き換え
                        new_content = new_content.replace(original_url, permanent_url)
                        article_updated = True
                        upload_count += 1
                    else:
                        print(f"    ❌ アップロード失敗（元のURLを使用）")
                except Exception as e:
                    print(f"    ❌ エラー: {e}")
        
        # コンテンツが更新された場合は保存
        if article_updated:
            article['content'] = new_content
            updated_count += 1
            print(f"  ✅ 記事を更新しました")
        else:
            print(f"  ⏭️ 更新不要")
        
        print()
    
    # JSONファイルを保存
    if updated_count > 0:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)
        print(f"✅ {upload_count}個の画像をアップロードし、{updated_count}件の記事を更新しました")
        print(f"📁 JSONファイルを保存しました: {json_path}")
    else:
        print("ℹ️ 更新が必要な画像はありませんでした")
    
    return upload_count, updated_count


if __name__ == "__main__":
    import os
    
    # 環境変数を確認
    if not os.environ.get("CLOUDFLARE_IMAGES_ACCOUNT_ID") or not os.environ.get("CLOUDFLARE_IMAGES_API_TOKEN"):
        print("❌ 環境変数 CLOUDFLARE_IMAGES_ACCOUNT_ID と CLOUDFLARE_IMAGES_API_TOKEN を設定してください", file=sys.stderr)
        sys.exit(1)
    
    json_path = Path("data/affiling_articles.json")
    
    if not json_path.exists():
        print(f"❌ JSONファイルが見つかりません: {json_path}", file=sys.stderr)
        sys.exit(1)
    
    upload_count, updated_count = find_and_upload_images(json_path)
    sys.exit(0 if upload_count > 0 or updated_count == 0 else 1)

