# 月蝕綺譚ONLINE 公式ティザーサイト 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `https://vibe.co.jp/luna-occulta-mmo` に、月蝕綺譚オンラインの1ページ縦長ティザー公式サイトを置く（月見台送客・ゲーム写し+ロゴ）。

**Architecture:** vibeリポ（Vite静的サイト+Cloudflare Workers Assets）の `public/luna-occulta-mmo.html` 1枚＋`public/luna-occulta-mmo-assets/` の素材。worker.js／wrangler.jsonc／vite.config.js は触らない（`/luna-occulta-mmo` は中継ルールに当たらず静的配信へ素通り）。写しは kitan-mmo の検分レーンで撮り、縁を切り落としてWebP化。

**Tech Stack:** 素のHTML/CSS（フレームワークなし・JSは reduced-motion と年号だけ）、Google Fonts（Shippori Mincho B1／M PLUS Rounded 1c）、cwebp、Godot 4.6.3（撮影のみ）、Pillow（切り落とし・OGP合成）。

## Global Constraints

- 設計書: `docs/superpowers/specs/2026-09-02-luna-occulta-mmo-site-design.md`（本人承認済み）
- 色: 宵闇藍 #131320/#1B1B2E・金泥 #D9A94C/#F0CE7E/#A67C2E（線と粒・面ベタ禁止）・蝕紅 #C93A2E（ロゴと見出し1点のみ・面積5%以下）・暗紫 #5C4470/#8E6B9E・月白 #E8E4D8・サブラベル #9D93B5
- 書体: 見出し Shippori Mincho B1 800／本文 同400–500／数字 M PLUS Rounded 1c 800
- 形: ボタン角丸5px・カード9–10px。羽二重パネル（金の額縁なし・面+二層影）。すりガラス禁忌。ヒット目標44px以上
- モーション: 押下90ms／小要素200ms／全画面420–500ms・easeOutCubic。常時揺れ・点滅禁止。`prefers-reduced-motion` で全停止
- 一人称は「ぼく」のみ（本文で一人称を使う場合）。「喩」「先に白状」族禁止。です・ます統一。段落1〜3文
- 主CTA: `https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo`。外部リンクは `target="_blank" rel="noopener"`
- kitan-mmo クライアントのコードは変更しない（共有ツリー・並行セッション中）。撮影は既存レーンの引数のみ
- vibeリポのコミットは自分のファイルだけ `git add <path>` 個別指定（他セッション由来の未追跡 worker.js 等を巻き込まない）
- 本番反映（`wrangler deploy`）は **S1＝本人の一言の後**。それまで `vite preview` で検分
- 記帳: 完了時 `python3 ~/Desktop/main/starter-office/tools/kicho.py --kata yugi --title "月蝕綺譚ONLINE公式サイト" --body "…" --kenshu yes`

## File Structure

- `public/luna-occulta-mmo.html` — ページ本体（HTML+`<style>`+末尾の小さな`<script>`）。1ファイル完結（rondo.html と同じ型）
- `public/luna-occulta-mmo-assets/logo.webp` — 題字ロゴ透過（幅1400）／`logo@2x.webp`（幅2800は原本上限1536のため作らず、1400一本）
- `public/luna-occulta-mmo-assets/shot_*.webp` — 街・里・野の写し（幅1600・q80）
- `public/luna-occulta-mmo-assets/og.jpg` — OGP 1200×630
- `public/luna-occulta-mmo-assets/icon.svg` — 蝕環ファビコン
- `scripts/verify-deploy.sh` — 生存確認1行追加
- `scripts/linkcheck-luna-occulta-mmo.sh` — ページ内 href の到達検査
- `tools/luna-occulta-mmo/crop_shots.py` — 写しの縁切り落とし＋WebP化
- `tools/luna-occulta-mmo/make_og.py` — OGP合成
- `HANDOFF_LUNA_OCCULTA_MMO.md` — 引き継ぎ

---

### Task 1: ロゴとファビコン

**Files:**
- Create: `public/luna-occulta-mmo-assets/logo.webp`
- Create: `public/luna-occulta-mmo-assets/icon.svg`

- [ ] **Step 1: ロゴを透過範囲で切り出しWebP化**（原本は触らない。bbox=(102,122,1485,840)+余白24px）

```bash
cd ~/Desktop/dev/vibe && python3 - <<'EOF'
from PIL import Image
src='/Users/hayatoikeda/Desktop/dev/kitan-mmo/assets2d/logo/logo_online_v1_16x9_alpha.png'
im=Image.open(src).convert('RGBA')
l,t,r,b=im.getchannel('A').getbbox(); pad=24
im=im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,b+pad)))
im.save('/tmp/claude-501/logo_crop.png')
print(im.size)
EOF
cwebp -q 92 -alpha_q 100 /tmp/claude-501/logo_crop.png -o public/luna-occulta-mmo-assets/logo.webp && ls -la public/luna-occulta-mmo-assets/logo.webp
```
Expected: `(1431, 766)` 前後・logo.webp が 200KB 以下

- [ ] **Step 2: 蝕環ファビコン（SVG手書き）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#131320"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#C93A2E" stroke-width="7" stroke-linecap="round" stroke-dasharray="104 22" transform="rotate(-60 32 32)"/>
  <circle cx="32" cy="32" r="12" fill="#0B0A14" stroke="#D9A94C" stroke-width="1.5"/>
</svg>
```

- [ ] **Step 3: 確認**: `file public/luna-occulta-mmo-assets/*` で WebP と SVG が出ること

---

### Task 2: 写しの撮影と加工

**Files:**
- Create: `tools/luna-occulta-mmo/crop_shots.py`
- Create: `public/luna-occulta-mmo-assets/shot_{tsukigakure,mizu,senmai,sumiyaki,sakai,field}.webp`

**Interfaces:** 後続タスクは `shot_<id>.webp`（幅1600・16:7.5前後）を `<img>` で参照

- [ ] **Step 1: 街4つを --town-preview で撮る**（通信なし・2560×1200・各街2地点=地上）。撮影地点は既存ボードで良かった地点を流用: mizu=太鼓橋(0,2)/月環(0,-8)・senmai=市の広場(0,0)・sumiyaki=窯前(0,4)・sakai=逆さ提灯の通り(0,-4)

```bash
cd ~/Desktop/dev/kitan-mmo && S=/tmp/claude-501/mmo-shots && mkdir -p $S
for spec in "mizu|0:2:$S/mizu_a.png|0:-8:$S/mizu_b.png" "senmai|0:0:$S/senmai_a.png|0:8:$S/senmai_b.png" "sumiyaki|0:4:$S/sumiyaki_a.png|0:-6:$S/sumiyaki_b.png" "sakai|0:-4:$S/sakai_a.png|0:6:$S/sakai_b.png"; do
  town=${spec%%|*}; shots=${spec#*|}
  godot --path client --resolution 2560x1200 res://scenes/town.tscn -- --town=$town --town-preview --shots="$shots" --shot-interval=3 --quit-after=14 >/dev/null 2>&1
done; ls -la $S
```
Expected: 8枚のPNG（1枚 2560×1200）。真っ暗・空のものは地点をずらして撮り直す

- [ ] **Step 2: 月隠の里と野を本番サーバーで撮る**（使い捨てキャラ `KITAN_DEVICE_SUFFIX=site` ・夜固定 `--tod=0.80`）

```bash
cd ~/Desktop/dev/kitan-mmo && S=/tmp/claude-501/mmo-shots
KITAN_DEVICE_SUFFIX=site KITAN_NAME=写し番 godot --path client --resolution 2560x1200 res://scenes/plaza.tscn -- --tod=0.80 --quit-after=12 --shot=$S/tsukigakure_a.png >/dev/null 2>&1
KITAN_DEVICE_SUFFIX=site godot --path client --resolution 2560x1200 res://scenes/field.tscn -- --field=1 --cam-at=0,14 --tod=0.80 --quit-after=12 --shot=$S/field_a.png >/dev/null 2>&1
ls -la $S/tsukigakure_a.png $S/field_a.png
```
Expected: 2枚。未契約で野へ入れない（403で里へ戻る）場合は `KITAN_SPIRIT=sakuya` を付けて再試行。それでも駄目なら野は諦め、里だけ使う

- [ ] **Step 3: 縁切り落とし＋WebP化の道具**

```python
# tools/luna-occulta-mmo/crop_shots.py
"""検分レーンの写し(2560x1200)からHUD(上60px場所名/右上RTT/下110pxチャット欄)を切り落として1600幅WebPへ。
使い方: python3 tools/luna-occulta-mmo/crop_shots.py <src_dir> <dst_dir>"""
import sys, pathlib, subprocess
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
TOP, BOTTOM, SIDE = 70, 120, 60
for p in sorted(src.glob('*.png')):
    im = Image.open(p).convert('RGB'); w, h = im.size
    im = im.crop((SIDE, TOP, w - SIDE, h - BOTTOM))
    tmp = dst / (p.stem + '.png'); im.save(tmp)
    out = dst / ('shot_' + p.stem + '.webp')
    subprocess.run(['cwebp', '-q', '80', '-resize', '1600', '0', str(tmp), '-o', str(out)], check=True, capture_output=True)
    tmp.unlink(); print(out.name, im.size, out.stat().st_size // 1024, 'KB')
```

- [ ] **Step 4: 実行して目視で選ぶ**

```bash
cd ~/Desktop/dev/vibe && python3 tools/luna-occulta-mmo/crop_shots.py /tmp/claude-501/mmo-shots /tmp/claude-501/mmo-webp && ls /tmp/claude-501/mmo-webp
```
各街1枚を結が選び `public/luna-occulta-mmo-assets/shot_<id>.webp` にコピー（a/bの両方はボード `~/Desktop/main/_boards/kitan_mmo_site/` にも置き、千枚・炭焼・境は本人の掲載可否待ちにする）

- [ ] **Step 5: Godotプロセスの後始末**: `pgrep -fl "godot --path client" || true` で自分の起動分が残っていないこと（他の Godot.app は触らない）

---

### Task 3: ページ骨組み＋ヒーロー（pro-ui-director の型で）

**Files:**
- Create: `public/luna-occulta-mmo.html`

**Interfaces:** CSSトークン `--yoiyami --yoiyami-2 --kindei --kindei-hi --kindei-lo --shokko --anshi --anshi-sakura --geppaku --sub --line`。節は `<section id="world|pillars|towns|realms|origin|join">`

- [ ] **Step 1: `/pro-ui-director` を読み、方向宣言（レジスター=物語／サーフェス=web LP）を確認**

- [ ] **Step 2: head（meta/OGP/フォント）とトークン・共通部品**

```html
<!doctype html><html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>月蝕綺譚ONLINE | 公式サイト</title>
<meta name="description" content="月蝕綺譚の世界を、みんなで歩く。宵闇の3D世界を狩り、集う新作MMORPG『月蝕綺譚ONLINE』公式サイト。iOS / Android 近日公開。">
<link rel="canonical" href="https://vibe.co.jp/luna-occulta-mmo">
<meta property="og:type" content="website"><meta property="og:site_name" content="Studio VIBE">
<meta property="og:title" content="月蝕綺譚ONLINE | 公式サイト">
<meta property="og:description" content="月蝕の夜に、金だけが灯る。宵闇の3D世界を歩き、狩り、集う新作MMORPG。iOS / Android 近日公開。">
<meta property="og:url" content="https://vibe.co.jp/luna-occulta-mmo">
<meta property="og:image" content="https://vibe.co.jp/luna-occulta-mmo-assets/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/luna-occulta-mmo-assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;700;800&family=M+PLUS+Rounded+1c:wght@800&display=swap" rel="stylesheet">
```
```css
:root{--yoiyami:#131320;--yoiyami-2:#1b1b2e;--panel:#100e1c;--kindei:#d9a94c;--kindei-hi:#f0ce7e;--kindei-lo:#a67c2e;--shokko:#c93a2e;--anshi:#5c4470;--anshi-sakura:#8e6b9e;--geppaku:#e8e4d8;--sub:#9d93b5;--line:rgba(217,169,76,.28);--line-dim:rgba(217,169,76,.14);--serif:"Shippori Mincho B1","Hiragino Mincho ProN",serif;--num:"M PLUS Rounded 1c",sans-serif;--w:1080px;--ease:cubic-bezier(.22,.61,.36,1)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;color-scheme:dark}
body{background:var(--yoiyami);color:var(--geppaku);font-family:var(--serif);font-size:16px;line-height:1.9;letter-spacing:.04em;font-feature-settings:"palt" 1;-webkit-font-smoothing:antialiased;overflow-x:clip}
.gold{background:linear-gradient(175deg,var(--kindei-hi) 8%,var(--kindei) 55%,var(--kindei-lo) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 28px;border:1px solid var(--kindei);border-radius:5px;color:var(--kindei-hi);text-decoration:none;font-weight:700;letter-spacing:.12em;transition:background .09s var(--ease),transform .09s var(--ease)}
.btn:hover{background:rgba(217,169,76,.10)}.btn:active{transform:translateY(1px)}
.btn-primary{background:linear-gradient(180deg,rgba(217,169,76,.18),rgba(217,169,76,.06))}
.panel{background:var(--panel);border-radius:10px;box-shadow:0 1px 0 rgba(240,206,126,.08) inset,0 24px 48px -28px rgba(0,0,0,.8),0 6px 16px -10px rgba(0,0,0,.6)}
.eyebrow{font-size:12px;letter-spacing:.32em;color:var(--kindei);text-transform:uppercase}
h2{font-size:clamp(26px,4.4vw,38px);font-weight:800;letter-spacing:.14em;line-height:1.35}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html{scroll-behavior:auto}}
```

- [ ] **Step 3: ヒーロー**（ロゴ主役・蝕環の呼吸・コピー・CTA2つ）

```html
<header class="hero" id="top">
  <div class="hero-ring" aria-hidden="true"></div>
  <img class="hero-logo" src="/luna-occulta-mmo-assets/logo.webp" width="1431" height="766" alt="月蝕綺譚ONLINE" fetchpriority="high">
  <p class="hero-copy">月蝕の夜に、金だけが灯る。</p>
  <p class="hero-sub">月蝕綺譚の世界を、みんなで歩く新作MMORPG</p>
  <p class="hero-plat"><span>iOS</span><span>Android</span><span class="soon">近日公開</span></p>
  <div class="hero-cta">
    <a class="btn btn-primary" href="https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo" target="_blank" rel="noopener">月見台に登録して続報を受け取る</a>
    <a class="btn" href="#world">世界を見る</a>
  </div>
</header>
```
```css
.hero{position:relative;min-height:100svh;display:grid;place-content:center;justify-items:center;text-align:center;padding:64px 20px 48px;overflow:hidden;background:radial-gradient(900px 600px at 50% 30%,rgba(92,68,112,.28),transparent 65%),var(--yoiyami)}
.hero-ring{position:absolute;inset:auto;top:50%;left:50%;width:min(78vw,620px);aspect-ratio:1;transform:translate(-50%,-56%);border-radius:50%;border:2px solid rgba(217,169,76,.22);box-shadow:0 0 60px rgba(217,169,76,.10),inset 0 0 40px rgba(217,169,76,.06);animation:breathe 6s var(--ease) infinite alternate;pointer-events:none}
@keyframes breathe{from{opacity:.55;transform:translate(-50%,-56%) scale(.98)}to{opacity:1;transform:translate(-50%,-56%) scale(1.02)}}
.hero-logo{position:relative;width:min(92vw,760px);height:auto;filter:drop-shadow(0 12px 40px rgba(0,0,0,.6))}
.hero-copy{margin-top:18px;font-size:clamp(20px,3.6vw,28px);font-weight:700;letter-spacing:.2em}
.hero-sub{margin-top:8px;color:var(--sub);font-size:14px;letter-spacing:.14em}
.hero-plat{display:flex;gap:10px;margin-top:22px;font-family:var(--num);font-size:12px;letter-spacing:.2em}
.hero-plat span{padding:4px 12px;border:1px solid var(--line);border-radius:5px;color:var(--kindei)}
.hero-plat .soon{border-color:var(--shokko);color:#e0685c}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
```

- [ ] **Step 4: ローカルで見る**: `cd ~/Desktop/dev/vibe && npx vite build >/dev/null && ls dist/luna-occulta-mmo.html` → Browserペイン（`.claude/launch.json` は使わず `npx vite preview --port 4173` を preview_start の `url` 添付で。終わったら止める）

---

### Task 4: 世界・遊びの柱・街の写し・この先の夜・本編との関係・締めCTA・フッター

**Files:**
- Modify: `public/luna-occulta-mmo.html`

- [ ] **Step 1: 世界（#world）**

```html
<section id="world" class="sec">
  <p class="eyebrow">World</p>
  <h2 class="gold">宵闇の世界を、歩く</h2>
  <div class="world-grid">
    <figure class="panel shot"><img src="/luna-occulta-mmo-assets/shot_tsukigakure_a.webp" width="1600" height="750" alt="月隠の里の夜景" loading="lazy"></figure>
    <div class="world-text">
      <p>『月蝕綺譚 -Luna Occulta-』の世界そのままに、月蝕の夜が続く里と野を、みんなで歩けるようになりました。</p>
      <p>ローポリの3D世界を、見下ろしの視点で。灯籠の光だまりと霧の向こうに、妖（あやかし）が潜みます。</p>
      <p>スマホひとつ、横持ちで。狩って、集めて、里で集う。夜は、ここから始まります。</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: 遊びの柱（#pillars・カード5枚）**

```html
<section id="pillars" class="sec">
  <p class="eyebrow">Play</p><h2 class="gold">遊びの柱</h2>
  <ul class="cards">
    <li class="panel card"><span class="card-no">01</span><h3>六つの道</h3><p>剣士・陰陽師・神楽・隠密・狩人・商人。旅人として夜に出て、道を選びます。</p></li>
    <li class="panel card"><span class="card-no">02</span><h3>昼と夜がめぐる</h3><p>世界の1日は40分。昼は野が明るく、夕暮れから灯籠と窓明かりが灯り、夜が本作の顔になります。</p></li>
    <li class="panel card"><span class="card-no">03</span><h3>里と、四つの街</h3><p>中央の月隠の里から、水の里・千枚の里・炭焼きの里・境の宿場へ。街ごとに薬師・市・打ち師・賭場の役割があります。</p></li>
    <li class="panel card"><span class="card-no">04</span><h3>淵の底</h3><p>月蝕の淵の北端、岩の口から下る階層ダンジョン。深いほど妖は強く、実りは大きく。</p></li>
    <li class="panel card"><span class="card-no">05</span><h3>技の樹と、連れ</h3><p>技の樹で自分の型を育て、最大4人のパーティで淵へ。里ではチャットとエモートで集えます。</p></li>
  </ul>
</section>
```
```css
.sec{max-width:var(--w);margin:0 auto;padding:88px 20px}
.cards{list-style:none;display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:28px}
.card{padding:26px 22px}.card-no{font-family:var(--num);font-size:12px;letter-spacing:.3em;color:var(--kindei-lo)}
.card h3{margin-top:8px;font-size:19px;font-weight:800;letter-spacing:.12em;color:var(--kindei-hi)}.card p{margin-top:10px;font-size:14.5px;color:rgba(232,228,216,.86)}
```

- [ ] **Step 3: 街の写し（#towns・ギャラリー）**: 月隠の里・水の里は既定で掲載。千枚・炭焼・境は `data-pending="1"` を付けておき、本人可否まで **非表示**（CSSで `[data-pending]{display:none}`）。可否が出たら属性を外すだけ

```html
<section id="towns" class="sec">
  <p class="eyebrow">Towns</p><h2 class="gold">夜の街々</h2>
  <div class="gallery">
    <figure class="panel shot"><img src="/luna-occulta-mmo-assets/shot_tsukigakure_a.webp" width="1600" height="750" alt="月隠の里" loading="lazy"><figcaption><b>月隠の里</b><span>すべての夜が始まる、中央の里</span></figcaption></figure>
    <figure class="panel shot"><img src="/luna-occulta-mmo-assets/shot_mizu_a.webp" width="1600" height="750" alt="水の里" loading="lazy"><figcaption><b>水の里</b><span>川沿いの宿場。薬師の御神酒</span></figcaption></figure>
    <figure class="panel shot" data-pending="1"><img src="/luna-occulta-mmo-assets/shot_senmai_a.webp" width="1600" height="750" alt="千枚の里" loading="lazy"><figcaption><b>千枚の里</b><span>棚田と夕暮れ。市と料理場</span></figcaption></figure>
    <figure class="panel shot" data-pending="1"><img src="/luna-occulta-mmo-assets/shot_sumiyaki_a.webp" width="1600" height="750" alt="炭焼きの里" loading="lazy"><figcaption><b>炭焼きの里</b><span>窯の火と灰の地。打ち師の工房</span></figcaption></figure>
    <figure class="panel shot" data-pending="1"><img src="/luna-occulta-mmo-assets/shot_sakai_a.webp" width="1600" height="750" alt="境の宿場" loading="lazy"><figcaption><b>境の宿場</b><span>黒鳥居と逆さ提灯。賭場と番付</span></figcaption></figure>
  </div>
</section>
```
```css
.gallery{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-top:28px}
.shot{overflow:hidden}.shot img{display:block;width:100%;height:auto;aspect-ratio:1600/750;object-fit:cover}
.shot figcaption{display:flex;flex-direction:column;gap:2px;padding:12px 16px 14px;border-top:1px solid var(--line-dim)}.shot figcaption b{color:var(--kindei-hi);letter-spacing:.14em}.shot figcaption span{font-size:12.5px;color:var(--sub)}
[data-pending]{display:none}
```

- [ ] **Step 4: この先の夜（#realms・文章のみ）／本編との関係（#origin）／締めCTA（#join）／フッター**

```html
<section id="realms" class="sec">
  <p class="eyebrow">Beyond</p><h2 class="gold">四つの門の、その先</h2>
  <p class="lead">街の奥に、閉じたままの門があります。門の先は、まだ誰も見ていません。</p>
  <ul class="realm-list">
    <li><b>蝕城</b><span>鬼の本城。篝火と赤い月</span></li>
    <li><b>天ノ浮橋</b><span>雲の上の天界</span></li>
    <li><b>竜宮</b><span>深海の宮。珊瑚と真珠</span></li>
    <li><b>根の国</b><span>黄泉。骨と逆さ木</span></li>
  </ul>
</section>
<section id="origin" class="sec">
  <p class="eyebrow">Origin</p><h2 class="gold">『月蝕綺譚』から続く夜</h2>
  <p class="lead">本作は、CryptoNinja外伝『月蝕綺譚 -Luna Occulta-』の姉妹作です。同じ世界、同じ夜。御霊たちの物語は本編で、みんなで歩く夜は本作で。</p>
  <p class="lead">会員基盤「月見台」とのID連携を予定しています。</p>
  <p class="links"><a class="btn" href="https://vibe.co.jp/luna-occulta" target="_blank" rel="noopener">本編『月蝕綺譚』公式サイト</a></p>
</section>
<section id="join" class="sec join">
  <p class="eyebrow">Join</p><h2 class="gold">続報は、月見台で</h2>
  <p class="lead">配信の時期・テスト参加のお知らせは、月見台の会員へ最初に届けます。</p>
  <div class="hero-cta"><a class="btn btn-primary" href="https://vibe.co.jp/luna-occulta/tsukimidai?via=mmo" target="_blank" rel="noopener">月見台に登録する</a></div>
  <p class="social"><a href="https://x.com/luna_occulta" target="_blank" rel="noopener">X @luna_occulta</a><a href="https://www.youtube.com/@luna_occulta_game" target="_blank" rel="noopener">YouTube</a></p>
</section>
<footer class="foot">
  <p>© <span id="y">2026</span> Studio VIBE</p>
  <p><a href="https://vibe.co.jp/" target="_blank" rel="noopener">Studio VIBE</a> ・ <a href="https://vibe.co.jp/luna-occulta/privacy" target="_blank" rel="noopener">プライバシーポリシー</a></p>
</footer>
<script>document.getElementById('y').textContent=new Date().getFullYear()</script>
```

- [ ] **Step 5: 目視**: `npx vite build` → preview で 375/390/430/1280 幅を撮る。金の面ベタ・白箱・折返し事故がないこと

---

### Task 5: OGP画像

**Files:**
- Create: `tools/luna-occulta-mmo/make_og.py`
- Create: `public/luna-occulta-mmo-assets/og.jpg`

- [ ] **Step 1: 合成（ロゴを宵闇藍の地に置き、下に細い金の線と英字）**

```python
# tools/luna-occulta-mmo/make_og.py — OGP 1200x630。ロゴ配置のみ（生成画への外科ではない）
from PIL import Image, ImageDraw
logo = Image.open('/tmp/claude-501/logo_crop.png').convert('RGBA')
W, H = 1200, 630
bg = Image.new('RGBA', (W, H), '#131320')
glow = Image.new('RGBA', (W, H), (0,0,0,0)); g = ImageDraw.Draw(glow)
g.ellipse((W/2-420, H/2-260, W/2+420, H/2+260), fill=(92,68,112,70))
bg = Image.alpha_composite(bg, glow.resize((W,H)))
lw = 880; lh = round(logo.height * lw / logo.width); logo = logo.resize((lw, lh), Image.LANCZOS)
bg.alpha_composite(logo, ((W-lw)//2, (H-lh)//2 - 20))
d = ImageDraw.Draw(bg); d.line((W/2-160, H-84, W/2+160, H-84), fill=(217,169,76,180), width=1)
bg.convert('RGB').save('public/luna-occulta-mmo-assets/og.jpg', quality=88)
print('ok')
```
Run: `cd ~/Desktop/dev/vibe && python3 tools/luna-occulta-mmo/make_og.py` → Expected: `ok`・`og.jpg` 1200×630

- [ ] **Step 2: Readで目視**（ロゴが切れていない・地が純黒でない）

---

### Task 6: 検証（ビルド・幅・reduced-motion・リンク・AI臭・生存確認行）

**Files:**
- Create: `scripts/linkcheck-luna-occulta-mmo.sh`
- Modify: `scripts/verify-deploy.sh`（`check "御用板" …` の直後に1行）

- [ ] **Step 1: リンク検査スクリプト**

```bash
#!/bin/bash
# public/luna-occulta-mmo.html の外部 href を全数 curl（200/301/302/307 を合格）
set -u; fail=0
for u in $(grep -oE 'href="https?://[^"]+"' public/luna-occulta-mmo.html | sed 's/href="//;s/"$//' | sort -u); do
  code=$(curl -s -o /dev/null -m 20 -A 'Mozilla/5.0 (linkcheck)' -w '%{http_code}' "$u")
  case "$code" in 200|301|302|307) echo "OK  $code $u";; *) echo "NG  $code $u"; fail=1;; esac
done
for a in $(grep -oE '(src|href)="/luna-occulta-mmo-assets/[^"]+"' public/luna-occulta-mmo.html | sed 's/.*="//;s/"$//' | sort -u); do
  [ -f "public$a" ] && echo "OK  file $a" || { echo "NG  missing $a"; fail=1; }
done
exit $fail
```
Run: `bash scripts/linkcheck-luna-occulta-mmo.sh` → Expected: 全行OK・exit 0

- [ ] **Step 2: verify-deploy.sh に追加**

```bash
check "月蝕綺譚ONLINE" "https://vibe.co.jp/luna-occulta-mmo" 200
```

- [ ] **Step 3: ビルドと幅検分**: `npx vite build` 緑 → preview を Browser ペインで 375/390/430/1280 幅スクショ → `resize_window` を desktop に戻す → preview停止

- [ ] **Step 4: reduced-motion**: `javascript_tool` で `matchMedia('(prefers-reduced-motion: reduce)')` を仮定できないため、CSSの `@media (prefers-reduced-motion: reduce)` 節が `animation:none` を含むことを grep で確認

- [ ] **Step 5: AI臭検査**: `/ai-smell-guard` でページ本文（コピー）を検品。ERROR 0 にする

- [ ] **Step 6: 本人向けボード**: 幅4種のスクショを `~/Desktop/main/_boards/kitan_mmo_site/` に置く（cwd配下＝リンク可）

---

### Task 7: コミット・引き継ぎ・記帳（デプロイは本人GO後）

**Files:**
- Create: `HANDOFF_LUNA_OCCULTA_MMO.md`
- Modify: memory `project_kitan_mmo_site.md`（新規）＋ `MEMORY.md` 1行

- [ ] **Step 1: 個別指定でコミット**

```bash
cd ~/Desktop/dev/vibe && git add public/luna-occulta-mmo.html public/luna-occulta-mmo-assets scripts/linkcheck-luna-occulta-mmo.sh scripts/verify-deploy.sh tools/luna-occulta-mmo docs/superpowers/plans/2026-09-02-luna-occulta-mmo-site.md HANDOFF_LUNA_OCCULTA_MMO.md
git commit -m "luna-occulta-mmo: 月蝕綺譚ONLINE 公式ティザーサイト（静的1枚・月見台送客・未デプロイ）

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
⚠ `scripts/verify-deploy.sh` は他セッションの未コミット差分（M）を含む。`git add -p` で自分の1行だけ載せる

- [ ] **Step 2: HANDOFF**（現在地・次＝本人GO→`npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh`・裁定事項・地雷）

- [ ] **Step 3: 記帳**: `python3 ~/Desktop/main/starter-office/tools/kicho.py --kata yugi --title "月蝕綺譚ONLINE公式サイト（ティザー）" --body "vibe.co.jp/luna-occulta-mmo 静的1枚・未デプロイ・S1待ち" --kenshu yes`

- [ ] **Step 4: 本人へ報告**: ボード（linkcheck.sh 通過リンク）・掲載可否の3街・デプロイGO待ちの3点

---

## S1（本人GO後のみ）

```bash
cd ~/Desktop/dev/vibe && npm run build && npx wrangler deploy && bash scripts/verify-deploy.sh && curl -sI https://vibe.co.jp/luna-occulta-mmo | head -3
```
