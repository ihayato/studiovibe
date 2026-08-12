// Rondo βテスターフェーズの不具合・エラー報告フォームの受け口(vibe.co.jp/rondo-report)。
// Turnstileをvibe自身の鍵(CF_SECRET_KEY)で検証してから、
// rondo Worker の報告API(/api/sales/report)へ専用Bearerで転送する。
// 台帳記録とDiscord通知はrondo側の責務。Bearerは既存のRONDO_CLAIM_KEYを共用する。
const RONDO_REPORT_URL = 'https://rondo.nubonba.workers.dev/api/sales/report';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS: only allow same-origin (api/rondo-apply.js と同型)
    const origin = req.headers.origin || req.headers.referer || '';
    const allowedOrigins = ['https://vibe.co.jp', 'http://localhost:5173', 'http://localhost:3000'];
    if (!allowedOrigins.some(o => origin.startsWith(o))) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { email, category, body, env, turnstileToken, website } = req.body || {};

    // honeypot: botには受理の顔をして捨てる
    if (website) {
        return res.status(200).json({ ok: true });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'メールアドレスをご確認ください。' });
    }
    if (!body || String(body).trim().length < 10) {
        return res.status(400).json({ error: '報告内容を10文字以上で入力してください。' });
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

    if (!process.env.RONDO_CLAIM_KEY) {
        return res.status(500).json({ error: 'ただいま受付を準備中です。時間をおいてお試しください。' });
    }
    try {
        const r = await fetch(RONDO_REPORT_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.RONDO_CLAIM_KEY}`,
            },
            body: JSON.stringify({
                offer: 'rondo-presale',
                email,
                category: String(category || 'other').slice(0, 20),
                body: String(body).slice(0, 4000),
                env: String(env || '').slice(0, 500),
                source: 'vibe-lp',
            }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || d.ok !== true) {
            return res.status(400).json({ error: '送信に失敗しました。時間をおいてお試しください。' });
        }
        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(502).json({ error: '送信に失敗しました。時間をおいてお試しください。' });
    }
}
