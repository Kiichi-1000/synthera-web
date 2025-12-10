"""
Cloudflare Images API統合モジュール
Notionの一時URLから画像をダウンロードし、Cloudflare Imagesにアップロードして永続URLを取得します。
"""
import hashlib
import io
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Optional


CLOUDFLARE_IMAGES_API_BASE = "https://api.cloudflare.com/client/v4"
CLOUDFLARE_IMAGES_ACCOUNT_ID = os.environ.get("CLOUDFLARE_IMAGES_ACCOUNT_ID", "84c63b21ee19071dcfac86d195478443")
CLOUDFLARE_IMAGES_API_TOKEN = os.environ.get("CLOUDFLARE_IMAGES_API_TOKEN", "a2sdidwH8aFyQc04TkVMJhVxxik_MycgrRMfuLQe")


def is_cloudflare_url(url: str) -> bool:
    """URLがCloudflare ImagesのURLかどうかを判定"""
    if not url:
        return False
    return "imagedelivery.net" in url or "cloudflare.com" in url


def is_permanent_url(url: str) -> bool:
    """URLが永続的なURLかどうかを判定（Notionの一時URLでないか）"""
    if not url:
        return False
    # Notionの一時URLには通常、X-Amz-Expiresなどのパラメータが含まれる
    if "X-Amz-Expires" in url or "X-Amz-Signature" in url:
        return False
    # Cloudflare ImagesのURLは永続的
    if is_cloudflare_url(url):
        return True
    # 外部URL（http/https）で、Notionの一時URLでない場合は永続的とみなす
    if url.startswith("http://") or url.startswith("https://"):
        # NotionのS3 URLパターンをチェック
        if "prod-files-secure.s3" in url or "notion-static.com" in url:
            # 署名付きURLの可能性がある
            if "X-Amz-" in url:
                return False
    return True


def download_image(url: str) -> Optional[bytes]:
    """URLから画像をダウンロード"""
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "Mozilla/5.0")
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"[WARNING] 画像のダウンロードに失敗しました: {url[:100]}... - {e}", file=sys.stderr)
        return None


def upload_to_cloudflare_images(image_data: bytes, image_id: Optional[str] = None) -> Optional[str]:
    """
    Cloudflare Imagesに画像をアップロードして永続URLを取得
    
    Args:
        image_data: 画像のバイナリデータ
        image_id: オプションの画像ID（指定しない場合は自動生成）
    
    Returns:
        永続URL、失敗時はNone
    """
    if not CLOUDFLARE_IMAGES_ACCOUNT_ID or not CLOUDFLARE_IMAGES_API_TOKEN:
        print("[WARNING] Cloudflare Imagesの認証情報が設定されていません。", file=sys.stderr)
        return None
    
    try:
        # Cloudflare Images API: 直接アップロード
        url = f"{CLOUDFLARE_IMAGES_API_BASE}/accounts/{CLOUDFLARE_IMAGES_ACCOUNT_ID}/images/v1"
        
        # multipart/form-dataでアップロード
        boundary = "----WebKitFormBoundary" + hashlib.md5(str(image_id or "").encode()).hexdigest()[:16]
        
        # multipart/form-dataの構築
        body_parts = []
        body_parts.append(f"--{boundary}\r\n".encode())
        body_parts.append(b'Content-Disposition: form-data; name="file"; filename="image"\r\n')
        body_parts.append(b'Content-Type: image/jpeg\r\n\r\n')
        body_parts.append(image_data)
        body_parts.append(f"\r\n--{boundary}--\r\n".encode())
        
        body = b"".join(body_parts)
        
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Authorization", f"Bearer {CLOUDFLARE_IMAGES_API_TOKEN}")
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))
            
            if not result.get("success"):
                print(f"[WARNING] Cloudflare Imagesアップロードに失敗: {result}", file=sys.stderr)
                return None
            
            # 永続URLを取得
            image_result = result.get("result", {})
            variants = image_result.get("variants", [])
            if variants:
                # public variantを探す
                public_url = [v for v in variants if "/public" in v]
                if public_url:
                    return public_url[0]
                # なければ最初のvariantを使用
                return variants[0]
            
            # フォールバック: 手動でURLを構築
            image_id_from_result = image_result.get("id")
            if image_id_from_result:
                # アカウントハッシュを計算（実際にはAPIから取得する必要があるが、簡易的に）
                account_hash = hashlib.md5(CLOUDFLARE_IMAGES_ACCOUNT_ID.encode()).hexdigest()[:16]
                return f"https://imagedelivery.net/{account_hash}/{image_id_from_result}/public"
            
            print("[WARNING] 画像IDが取得できませんでした。", file=sys.stderr)
            return None
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if hasattr(e, 'read') else ""
        print(f"[WARNING] Cloudflare Images API エラー: {e.code} {e.reason}", file=sys.stderr)
        if error_body:
            print(f"[WARNING] {error_body}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[WARNING] Cloudflare Imagesアップロード中にエラーが発生しました: {e}", file=sys.stderr)
        return None


def upload_image_from_url(notion_url: str, image_id: Optional[str] = None) -> Optional[str]:
    """
    Notionの一時URLから画像をダウンロードし、Cloudflare Imagesにアップロードして永続URLを取得
    
    Args:
        notion_url: Notionの画像URL（一時URLまたは永続URL）
        image_id: オプションの画像ID
    
    Returns:
        永続URL、失敗時は元のURLを返す
    """
    if not notion_url:
        return None
    
    # 既に永続URLの場合はそのまま返す
    if is_permanent_url(notion_url):
        return notion_url
    
    # 画像をダウンロード
    image_data = download_image(notion_url)
    if not image_data:
        print(f"[WARNING] 画像のダウンロードに失敗したため、元のURLを使用します: {notion_url[:100]}...", file=sys.stderr)
        return notion_url
    
    # Cloudflare Imagesにアップロード
    permanent_url = upload_to_cloudflare_images(image_data, image_id)
    if permanent_url:
        print(f"[INFO] 画像をCloudflare Imagesにアップロードしました: {permanent_url}", file=sys.stderr)
        return permanent_url
    else:
        print(f"[WARNING] Cloudflare Imagesへのアップロードに失敗したため、元のURLを使用します: {notion_url[:100]}...", file=sys.stderr)
        return notion_url

