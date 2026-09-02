"""遊びの柱の画像を組む（写しのトリミング/並置のみ。生成画への外科ではない）。
使い方: python3 tools/luna-occulta-mmo/compose_pillars.py <shots_dir>
  <shots_dir>/plaza_0.30.png plaza_0.60.png plaza_0.80.png → pillar_daynight.webp（同じ里の昼・夕・夜を3帯で）
  <shots_dir>/fuchi_10.png（無ければ fuchi_3.png）        → pillar_fuchi.webp
  <shots_dir>/waza.png                                      → pillar_waza.webp"""
import sys, pathlib, subprocess
from PIL import Image, ImageDraw
S = pathlib.Path(sys.argv[1]); A = 'public/luna-occulta-mmo-assets/'
TOP, BOTTOM, SIDE = 120, 190, 40   # HUD帯（場所名/チャット欄）を避ける（2560x1200基準）
def webp(im, name, q=82):
    p = S / (name + '.png'); im.save(p)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), str(p), '-o', A + name + '.webp'], check=True)
    print(name, im.size, pathlib.Path(A + name + '.webp').stat().st_size // 1024, 'KB')
def hud_crop(p, cw, ch, cx=None, cy=None):
    im = Image.open(p).convert('RGB'); w, h = im.size; k = w / 2560
    cx = cx or w // 2; cy = cy or (int(TOP * k) + (h - int(BOTTOM * k))) // 2
    x0 = min(max(cx - cw // 2, int(SIDE * k)), w - int(SIDE * k) - cw); y0 = min(max(cy - ch // 2, int(TOP * k)), h - int(BOTTOM * k) - ch)
    return im.crop((x0, y0, x0 + cw, y0 + ch))
W, H = 1600, 900
# 昼・夕・夜（同じ画角の3帯。帯ごとに同じ座標を切る）
tods = [('0.30', '昼'), ('0.60', '夕'), ('0.80', '夜')]
if all((S / f'plaza_{t}.png').exists() for t, _ in tods):
    out = Image.new('RGB', (W, H), '#131320'); bw = (W - 2 * 6) // 3
    for i, (t, label) in enumerate(tods):
        im = Image.open(S / f'plaza_{t}.png').convert('RGB'); w, h = im.size; k = w / 2560
        # 3帯とも「里の中央」を同じ座標で切る（幅 bw*k / 高さ H*k を等倍で）
        ch = int((h - (TOP + BOTTOM) * k)); cw = int(ch * bw / H); cx = w // 2; cy = int(TOP * k) + ch // 2
        seg = im.crop((cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2)).resize((bw, H), Image.LANCZOS)
        out.paste(seg, (i * (bw + 6), 0))
    webp(out, 'pillar_daynight')
# 淵の底
src = S / 'fuchi_10.png' if (S / 'fuchi_10.png').exists() else S / 'fuchi_3.png'
if src.exists():
    im = Image.open(src); w, h = im.size; k = w / 2560
    webp(hud_crop(src, int(1920 * k), int(1080 * k)).resize((W, H), Image.LANCZOS), 'pillar_fuchi')
# 技の樹（UI画面。上下の帯はそのまま・中央16:9で切る）
if (S / 'waza.png').exists():
    im = Image.open(S / 'waza.png').convert('RGB'); w, h = im.size; cw = int(h * 16 / 9)
    x0 = (w - cw) // 2; webp(im.crop((x0, 0, x0 + cw, h)).resize((W, H), Image.LANCZOS), 'pillar_waza')
