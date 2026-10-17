// お問い合わせを Resend 経由でメール転送する Edge Function。
// 必要な環境変数(デプロイ時に secrets として設定):
//   RESEND_API_KEY     Resend の API キー
//   CONTACT_TO_EMAIL   転送先メールアドレス
//   CONTACT_FROM_EMAIL 送信元アドレス(未設定時は onboarding@resend.dev)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
};

interface NotifyPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return Response.json({ error: 'method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  const apiKey = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
  if (!apiKey) {
    return Response.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500, headers: CORS_HEADERS });
  }
  const to = (Deno.env.get('CONTACT_TO_EMAIL') ?? '27worksyukuri@gmail.com').trim();
  const from = (Deno.env.get('CONTACT_FROM_EMAIL') ?? 'onboarding@resend.dev').trim();

  let payload: NotifyPayload;
  try {
    payload = (await req.json()) as NotifyPayload;
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
  }

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const subject = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();
  if (!name || !email || !subject || !message) {
    return Response.json({ error: 'missing required fields' }, { status: 400, headers: CORS_HEADERS });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `ゆっくり27works <${from}>`,
      to: [to],
      reply_to: email,
      subject: `[お問い合わせ] ${subject}`,
      html:
        `<h2>サイトからのお問い合わせ</h2>` +
        `<p><b>お名前:</b> ${escapeHtml(name)}</p>` +
        `<p><b>メールアドレス:</b> ${escapeHtml(email)}</p>` +
        `<p><b>件名:</b> ${escapeHtml(subject)}</p>` +
        `<p><b>お問い合わせ内容:</b></p>` +
        `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return Response.json(
      { error: `Resend API error (${res.status})`, detail: detail.slice(0, 300) },
      { status: 502, headers: CORS_HEADERS },
    );
  }

  return Response.json({ ok: true }, { headers: CORS_HEADERS });
});
