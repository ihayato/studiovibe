export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, type, message, turnstileToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !turnstileToken) {
        return res.status(400).json({ error: '必須項目を入力してください。' });
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
                        { name: '👤 お名前', value: name, inline: true },
                        { name: '📧 メール', value: email, inline: true },
                        { name: '📋 種別', value: typeLabels[type] || type, inline: true },
                        { name: '💬 メッセージ', value: message },
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
