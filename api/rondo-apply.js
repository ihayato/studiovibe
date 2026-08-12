// Rondo先行販売(審査制)の申込フォームの受け口(vibe.co.jp/rondo-apply)。
// Turnstileをvibe自身の鍵(CF_SECRET_KEY)で検証してから、
// rondo Worker の審査API(/api/sales/apply)へ専用Bearerで転送する。
// 審査判定・台帳・Stripe Checkout発行・メールはrondo側の責務。
// Bearerは事前登録と同じ鍵(RONDO_CLAIM_KEY=rondo側TOKUTEN_CLAIM_KEY)を共用する。
const RONDO_APPLY_URL = 'https://rondo.nubonba.workers.dev/api/sales/apply';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS: only allow same-origin (api/rondo-reserve.js と同型)
    const origin = req.headers.origin || req.headers.referer || '';
    const allowedOrigins = ['https://vibe.co.jp', 'http://localhost:5173', 'http://localhost:3000'];
    if (!allowedOrigins.some(o => origin.startsWith(o))) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { email, fableEnv, stepExperience, mediaUrls, domain, selfSetup, turnstileToken, website } = req.body || {};

    // honeypot: botには合否だけ返して黙って捨てる(rondo側にも同じガードがあるがここで止める)
    if (website) {
        return res.status(200).json({ ok: true, verdict: 'rejected', reasons: [] });
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

    if (!process.env.RONDO_CLAIM_KEY) {
        return res.status(500).json({ error: 'ただいま受付を準備中です。時間をおいてお試しください。' });
    }
    try {
        const r = await fetch(RONDO_APPLY_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.RONDO_CLAIM_KEY}`,
            },
            body: JSON.stringify({
                offer: 'rondo-presale',
                email,
                fableEnv: String(fableEnv || '').slice(0, 200),
                stepExperience: String(stepExperience || '').slice(0, 2000),
                mediaUrls: (Array.isArray(mediaUrls) ? mediaUrls : []).slice(0, 10).map(u => String(u).slice(0, 300)),
                domain: String(domain || '').slice(0, 200),
                selfSetup: selfSetup === true,
                source: 'vibe-lp',
            }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || d.ok !== true) {
            const msg = d.error === 'not_configured'
                ? 'ただいま決済の準備中です。時間をおいてお試しください。'
                : '送信に失敗しました。時間をおいてお試しください。';
            return res.status(r.status === 503 ? 503 : 400).json({ error: msg });
        }
        // verdict / checkoutUrl / reasons をそのままページへ返す
        return res.status(200).json(d);
    } catch (err) {
        return res.status(502).json({ error: '送信に失敗しました。時間をおいてお試しください。' });
    }
}
