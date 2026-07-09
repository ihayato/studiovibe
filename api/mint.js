import {
    BaseError,
    ContractFunctionRevertedError,
    createPublicClient,
    createWalletClient,
    decodeEventLog,
    fallback,
    getAddress,
    http,
    isAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

// 渡島記念札コントラクト(VibeIslandCommemorative)のABI。このAPIが使う関数のみ
const vibeIslandCommemorativeAbi = [
    {
        type: 'function',
        name: 'mintTo',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'to', type: 'address' }],
        outputs: [{ name: 'tokenId', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'hasMinted',
        stateMutability: 'view',
        inputs: [{ name: '', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'maxSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    { type: 'error', name: 'NotMinter', inputs: [] },
    { type: 'error', name: 'SoldOut', inputs: [] },
    { type: 'error', name: 'AlreadyMinted', inputs: [] },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
        ],
    },
];

// CORS: 同一オリジンのみ許可(api/contact.jsと同じ書式)
const allowedOrigins = ['https://vibe.co.jp', 'http://localhost:5173', 'http://localhost:3000'];

// NFT_CHAIN: "base"(本番) | "baseSepolia"(テスト・省略時)
const nftChain = () => (process.env.NFT_CHAIN === 'base' ? base : baseSepolia);
const nftContractAddress = () => {
    const addr = process.env.NFT_CONTRACT_ADDRESS;
    return addr && addr.startsWith('0x') ? addr : null;
};

// ミント用ホットウォレット(minter権限のみ・ガス代分のETHだけを入れる)
// 0xプレフィックスの有無・前後の空白/改行は吸収する
const rawMinterKey = process.env.MINTER_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, '');
const MINTER_PRIVATE_KEY = rawMinterKey
    ? rawMinterKey.startsWith('0x')
        ? rawMinterKey
        : `0x${rawMinterKey}`
    : undefined;

// 公共RPCは混雑時に弾くのでフォールバック多重化(専用RPCがあれば先頭に)
const RPC_URLS = [
    process.env.NFT_RPC_URL,
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://base.llamarpc.com',
    'https://1rpc.io/base',
].filter((u) => Boolean(u));

function transport() {
    return fallback(RPC_URLS.map((u) => http(u)));
}

function clients() {
    const chain = nftChain();
    const t = transport();
    const publicClient = createPublicClient({ chain, transport: t });
    const account = privateKeyToAccount(MINTER_PRIVATE_KEY);
    const walletClient = createWalletClient({ chain, transport: t, account });
    return { publicClient, walletClient, account };
}

// 同一インスタンス内のnonce衝突を避けるため、ミント処理を直列化する
let mintQueue = Promise.resolve();
function enqueue(job) {
    const next = mintQueue.then(job, job);
    mintQueue = next.catch(() => {});
    return next;
}

async function handleGet(req, res) {
    const contract = nftContractAddress();
    if (!contract) {
        return res.status(503).json({ error: 'not_configured' });
    }
    try {
        const chain = nftChain();
        const publicClient = createPublicClient({ chain, transport: transport() });
        const [totalSupply, maxSupply] = await Promise.all([
            publicClient.readContract({
                address: contract,
                abi: vibeIslandCommemorativeAbi,
                functionName: 'totalSupply',
            }),
            publicClient.readContract({
                address: contract,
                abi: vibeIslandCommemorativeAbi,
                functionName: 'maxSupply',
            }),
        ]);
        return res.status(200).json({ totalSupply: Number(totalSupply), maxSupply: Number(maxSupply) });
    } catch (err) {
        console.error('mint GET failed:', err);
        return res.status(500).json({ error: 'read_failed' });
    }
}

async function handlePost(req, res) {
    const contract = nftContractAddress();
    if (!contract || !MINTER_PRIVATE_KEY) {
        return res.status(503).json({ error: 'not_configured' });
    }

    const { address: rawAddress, turnstileToken } = req.body || {};
    if (!turnstileToken) {
        return res.status(400).json({ error: 'invalid_request' });
    }
    if (typeof rawAddress !== 'string' || !isAddress(rawAddress)) {
        return res.status(400).json({ error: 'invalid_address' });
    }

    // Cloudflare Turnstile検証(api/contact.jsと同じ実装)
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
            return res.status(400).json({ error: 'bot_detected' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'turnstile_failed' });
    }

    const to = getAddress(rawAddress);

    try {
        const result = await enqueue(async () => {
            const { publicClient, walletClient, account } = clients();

            const [minted, totalSupply, maxSupply] = await Promise.all([
                publicClient.readContract({
                    address: contract,
                    abi: vibeIslandCommemorativeAbi,
                    functionName: 'hasMinted',
                    args: [to],
                }),
                publicClient.readContract({
                    address: contract,
                    abi: vibeIslandCommemorativeAbi,
                    functionName: 'totalSupply',
                }),
                publicClient.readContract({
                    address: contract,
                    abi: vibeIslandCommemorativeAbi,
                    functionName: 'maxSupply',
                }),
            ]);
            if (minted) return { status: 409 };
            if (totalSupply >= maxSupply) return { status: 410 };

            // 高負荷時は複数インスタンスが並走しnonceが衝突する。
            // revert(AlreadyMinted等)は即時伝播、それ以外は少し待って撃ち直す。
            let receipt;
            let lastError;
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const { request: mintRequest } = await publicClient.simulateContract({
                        address: contract,
                        abi: vibeIslandCommemorativeAbi,
                        functionName: 'mintTo',
                        args: [to],
                        account,
                    });
                    const hash = await walletClient.writeContract(mintRequest);
                    receipt = await publicClient.waitForTransactionReceipt({ hash });
                    break;
                } catch (e) {
                    if (
                        e instanceof BaseError &&
                        e.walk((x) => x instanceof ContractFunctionRevertedError)
                    ) {
                        throw e; // コントラクトのrevertはリトライしない(409/410に翻訳される)
                    }
                    lastError = e;
                    await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));
                }
            }
            if (!receipt) throw lastError;

            let tokenId = null;
            for (const log of receipt.logs) {
                try {
                    const event = decodeEventLog({
                        abi: vibeIslandCommemorativeAbi,
                        data: log.data,
                        topics: log.topics,
                    });
                    if (event.eventName === 'Transfer') {
                        tokenId = Number(event.args.tokenId);
                        break;
                    }
                } catch {
                    // 対象外のログは無視
                }
            }
            return { status: 200, hash: receipt.transactionHash, tokenId };
        });

        if (result.status === 409) {
            return res.status(409).json({ error: 'already_minted' });
        }
        if (result.status === 410) {
            return res.status(410).json({ error: 'sold_out' });
        }
        return res.status(200).json({ txHash: result.hash, tokenId: result.tokenId });
    } catch (error) {
        // RPCの読み取りが古くて事前チェックをすり抜けても、
        // コントラクト側のrevert理由を読んで正しい応答に翻訳する
        if (error instanceof BaseError) {
            const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
            const name = revert?.data?.errorName;
            if (name === 'AlreadyMinted') {
                return res.status(409).json({ error: 'already_minted' });
            }
            if (name === 'SoldOut') {
                return res.status(410).json({ error: 'sold_out' });
            }
        }
        console.error('mint failed:', error);
        return res.status(500).json({ error: 'mint_failed' });
    }
}

export default async function handler(req, res) {
    // CORS: 同一オリジンのみ許可
    const origin = req.headers.origin || req.headers.referer || '';
    if (!allowedOrigins.some((o) => origin.startsWith(o))) {
        return res.status(403).json({ error: 'forbidden' });
    }

    if (req.method === 'GET') {
        return handleGet(req, res);
    }
    if (req.method === 'POST') {
        return handlePost(req, res);
    }
    return res.status(405).json({ error: 'method_not_allowed' });
}
