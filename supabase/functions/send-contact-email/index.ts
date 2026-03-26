import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, message }: ContactRequest = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "必須項目が入力されていません" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailBody = `
新しいお問い合わせがあります

お名前: ${name}
メールアドレス: ${email}

お問い合わせ内容:
${message}

---
このメールは synthera ポートフォリオサイトのお問い合わせフォームから送信されました。
送信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
`;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          success: true,
          message: "お問い合わせを受け付けました。メール送信機能は現在設定中です。"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@synthera.dev",
        to: "synthera.2025@gmail.com",
        reply_to: email,
        subject: `【お問い合わせ】${name}様より`,
        text: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);

      return new Response(
        JSON.stringify({
          success: true,
          message: "お問い合わせを受け付けました。"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "お問い合わせを送信しました。ご連絡ありがとうございます。"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error processing contact form:", error);

    return new Response(
      JSON.stringify({
        error: "お問い合わせの処理中にエラーが発生しました。"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
