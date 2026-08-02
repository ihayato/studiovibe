// rondo販売LP(vibe.co.jp/rondo)の事前登録フォームの受け口。
// Turnstileをvibe自身の鍵(CF_SECRET_KEY)で検証してから、
// rondo Worker の特典受け皿(/api/tokuten/claim)へ専用Bearerで転送する。
// メール送信・台帳(tokuten_claims)はrondo側の責務。
const RONDO_CLAIM_URL = 'https://rondo.nubonba.workers.dev/api/tokuten/claim';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS: only allow same-origin (api/contact.js と同型)
    const origin = req.headers.origin || req.headers.referer || '';
    const allowedOrigins = ['https://vibe.co.jp', 'http://localhost:5173', 'http://localhost:3000'];
    if (!allowedOrigins.some(o => origin.startsWith(o))) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { email, turnstileToken, website } = req.body || {};

    // honeypot: botは黙って受理
    if (website) {
        return res.status(200).json({ ok: true });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'メールアドレスをご確認ください。' });
    }
    if (!turnstileToken) {
        return res.status(400).json({ error: 'ボット確認を完了してから送信してください。' });
    }

    // Verify Cloudflare Turnstile
    try {
        const turnstileRes = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: process.env.CF_SECRET_KEY,
                    response: turnstileToken,
                }),
            }
        );
        const turnstileData = await turnstileRes.json();
        if (!turnstileData.success) {
            return res.status(400).json({ error: 'ボット判定に失敗しました。再度お試しください。' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'ボット確認中にエラーが発生しました。時間をおいてお試しください。' });
    }

    // rondoの受け皿へ転送
    if (!process.env.RONDO_CLAIM_KEY) {
        return res.status(500).json({ error: 'ただいま受付を準備中です。時間をおいてお試しください。' });
    }
    try {
        const r = await fetch(RONDO_CLAIM_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.RONDO_CLAIM_KEY}`,
            },
            body: JSON.stringify({ offer: 'rondo-reserve', email, source: 'vibe-lp' }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || d.ok !== true) {
            const msg = d.error === 'invalid_email'
                ? 'メールアドレスをご確認ください。'
                : '送信に失敗しました。時間をおいてお試しください。';
            return res.status(400).json({ error: msg });
        }
    } catch (err) {
        return res.status(502).json({ error: '送信に失敗しました。時間をおいてお試しください。' });
    }

    return res.status(200).json({ ok: true });
}
