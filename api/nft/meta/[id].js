// 渡島記念札(VibeIslandCommemorative)のtokenURI。コントラクトのbaseURI + tokenIdで呼ばれる
// SITE_ORIGINはローカル検証用の上書き。省略時は本番オリジン
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://vibe.co.jp';

export default async function handler(req, res) {
    const { id } = req.query;
    const tokenId = Number(id);
    if (!Number.isInteger(tokenId) || tokenId < 1) {
        return res.status(400).json({ error: 'invalid_id' });
    }

    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).json({
        name: `STUDIO VIBE 渡島記念札 #${tokenId}`,
        description:
            '夜空に浮かぶStudio VIBEの島で、七つの衝動のかけらを集めた旅人に授与される渡島の証。桜の大樹が見守る月夜の記念。オープンエディション。',
        image: `${SITE_ORIGIN}/nft/tojo_thumb.jpg`,
        animation_url: `${SITE_ORIGIN}/nft/tojo_loop.mp4`,
        external_url: `${SITE_ORIGIN}/`,
        attributes: [
            { trait_type: 'Edition', value: '渡島記念' },
            { display_type: 'number', trait_type: '札番号', value: tokenId },
        ],
    });
}
