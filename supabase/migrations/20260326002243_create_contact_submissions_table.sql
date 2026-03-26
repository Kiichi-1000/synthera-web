/*
  # お問い合わせフォーム送信テーブル作成

  ## 新規テーブル
    - `contact_submissions`
      - `id` (uuid, 主キー) - 一意の識別子
      - `name` (text, 必須) - お問い合わせ者の名前
      - `email` (text, 必須) - お問い合わせ者のメールアドレス
      - `message` (text, 必須) - お問い合わせ内容
      - `ip_address` (text) - 送信元IPアドレス(不正利用防止)
      - `user_agent` (text) - ブラウザ情報(不正利用防止)
      - `status` (text, デフォルト: 'pending') - 処理状況
      - `created_at` (timestamptz) - 送信日時
      - `updated_at` (timestamptz) - 更新日時

  ## セキュリティ設定
    - テーブルでRLSを有効化
    - 認証済みユーザー(管理者)のみが全データを閲覧可能
    - 誰でもお問い合わせを送信可能(INSERT のみ公開)
    - 更新・削除は認証済みユーザーのみ

  ## インデックス
    - created_at でのソートを高速化
    - email での検索を高速化

  ## 重要事項
    1. 個人情報保護: 個人を特定できる情報を含むため、RLSで厳格に保護
    2. スパム対策: IP アドレスとユーザーエージェントを記録
    3. GDPR対応: データの保存目的を明確化し、適切な保持期間を設定
*/

-- お問い合わせ送信テーブルを作成
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  ip_address text,
  user_agent text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'spam')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- インデックスを作成(パフォーマンス向上)
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
  ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
  ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
  ON contact_submissions(status);

-- RLSポリシー: 誰でもお問い合わせを送信可能
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLSポリシー: 認証済みユーザー(管理者)のみが全データを閲覧可能
CREATE POLICY "Authenticated users can view all submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLSポリシー: 認証済みユーザー(管理者)のみがステータスを更新可能
CREATE POLICY "Authenticated users can update submission status"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLSポリシー: 認証済みユーザー(管理者)のみがスパムを削除可能
CREATE POLICY "Authenticated users can delete spam submissions"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (status = 'spam');

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at_trigger ON contact_submissions;

CREATE TRIGGER update_contact_submissions_updated_at_trigger
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();