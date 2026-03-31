const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = [
  'https://synthera.jp',
  'https://www.synthera.jp',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin requests (no Origin header)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, subject, message, honeypot } = req.body || {};

  // Honeypot anti-spam check
  if (honeypot) {
    return res.status(200).json({ success: true }); // Silently ignore bots
  }

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'お名前、メールアドレス、お問い合わせ内容は必須です。' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'メールアドレスの形式が正しくありません。' });
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return res.status(400).json({ error: '入力内容が長すぎます。' });
  }

  const safeSubject = subject ? subject.replace(/[\r\n]/g, '') : 'お問い合わせ';
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Synthera <noreply@synthera.jp>',
      to: ['synthera.2025@gmail.com'],
      replyTo: email,
      subject: `[お問い合わせ] ${safeSubject} — ${safeName}様より`,
      html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid #E5E0D8;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:3px;color:#0D0D0D;">SYNTHERA</p>
              <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8860B;">Contact Form</p>
            </td>
          </tr>

          <!-- Fields -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A7570;">お名前</p>
                    <p style="margin:0;font-size:16px;color:#0D0D0D;font-weight:500;">${safeName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-top:1px solid #E5E0D8;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A7570;">メールアドレス</p>
                    <p style="margin:0;font-size:16px;"><a href="mailto:${safeEmail}" style="color:#B8860B;text-decoration:none;">${safeEmail}</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-top:1px solid #E5E0D8;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A7570;">件名</p>
                    <p style="margin:0;font-size:16px;color:#0D0D0D;">${safeSubject}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:24px 40px 36px;">
              <div style="background:#FAF9F6;border-radius:8px;padding:24px;border-left:3px solid #B8860B;">
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A7570;">お問い合わせ内容</p>
                <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.8;">${safeMessage}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #E5E0D8;background:#FAF9F6;">
              <p style="margin:0;font-size:11px;color:#7A7570;text-align:center;">
                このメールは synthera.jp のお問い合わせフォームから送信されました
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `お名前: ${name}\nメールアドレス: ${email}\n件名: ${safeSubject}\n\n${message}`,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'メールの送信に失敗しました。しばらく後にお試しください。' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'サーバーエラーが発生しました。しばらく後にお試しください。' });
  }
};
