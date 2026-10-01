import { allowedRequestOrigin } from './_allowed-origin.js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS: only allow same-origin
    const allowedOrigins = ['https://vibe.co.jp', 'http://localhost:5173', 'http://localhost:3000'];
    if (!allowedRequestOrigin(req.headers, allowedOrigins)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email, type, message, turnstileToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !turnstileToken) {
        return res.status(400).json({ error: '必須項目を入力してください。' });
    }

    // Input length limits (prevent abuse)
    if (name.length > 100) {
        return res.status(400).json({ error: '名前は100文字以内で入力してください。' });
    }
    if (email.length > 254) {
        return res.status(400).json({ error: 'メールアドレスが長すぎます。' });
    }
    if (message.length > 5000) {
        return res.status(400).json({ error: 'メッセージは5000文字以内で入力してください。' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '有効なメールアドレスを入力してください。' });
    }

    // Sanitize inputs (strip potential injection)
    const sanitize = (str) => str.replace(/[<>]/g, '').trim();
    const safeName = sanitize(name);
    const safeMessage = sanitize(message);
    const safeType = ['production', 'speaking', 'recruitment', 'other'].includes(type) ? type : 'other';

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
        return res.status(500).json({ error: 'Turnstile検証中にエラーが発生しました。' });
    }

    // Map inquiry type
    const typeLabels = {
        production: '制作依頼',
        speaking: '講演依頼',
        recruitment: '採用について',
        other: 'その他',
    };

    // Send to Discord Webhook
    try {
        const embed = {
            embeds: [
                {
                    title: '📩 新しいお問い合わせ',
                    color: 0x7b2cbf,
                    fields: [
                        { name: '👤 お名前', value: safeName, inline: true },
                        { name: '📧 メール', value: email, inline: true },
                        { name: '📋 種別', value: typeLabels[safeType] || safeType, inline: true },
                        { name: '💬 メッセージ', value: safeMessage },
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        const webhookRes = await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed),
        });

        if (!webhookRes.ok) {
            return res.status(500).json({ error: '送信に失敗しました。しばらく経ってからお試しください。' });
        }
    } catch (err) {
        return res.status(500).json({ error: '送信中にエラーが発生しました。' });
    }

    return res.status(200).json({ message: '送信しました！' });
}
