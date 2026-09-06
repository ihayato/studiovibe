"""Why節の「同じ里の昼と夜」（2枚並置）を組む。写しのトリミング/並置のみ（生成画への外科ではない）。
使い方: python3 tools/luna-occulta-mmo/compose_daynight.py <shots_dir> [昼cx,夜cx]
  <shots_dir>/plaza_0.30.png（昼）と plaza_0.80.png（夜）＝2560x1200の検分レーン写し。
  cx＝各帯の切り出し中心x（原画ピクセル）。既定 800,1350＝名札（写し番/エマ/アトザ）が端で切れない位置（2026-09-06）。
  上下のHUD帯（場所名/チャット欄）は TOP/BOTTOM で避ける。"""
import sys, pathlib, subprocess
from PIL import Image
S = pathlib.Path(sys.argv[1]); A = 'public/luna-occulta-mmo-assets/'
CXS = [int(v) for v in (sys.argv[2] if len(sys.argv) > 2 else '800,1350').split(',')]
TOP, BOTTOM = 120, 190; W, H = 1600, 900; G = 6; pw = (W - G) // 2
out = Image.new('RGB', (W, H), '#131320')
for i, t in enumerate(['0.30', '0.80']):
    im = Image.open(S / f'plaza_{t}.png').convert('RGB'); w, h = im.size
    ch = h - TOP - BOTTOM; cw = int(ch * pw / H); x0 = min(max(CXS[i] - cw // 2, 0), w - cw)
    out.paste(im.crop((x0, TOP, x0 + cw, TOP + ch)).resize((pw, H), Image.LANCZOS), (i * (pw + G), 0))
    print(t, 'crop x0=', x0, 'cw=', cw)
p = S / 'pillar_daynight.png'; out.save(p)
subprocess.run(['cwebp', '-quiet', '-q', '82', str(p), '-o', A + 'pillar_daynight.webp'], check=True)
print('pillar_daynight.webp', pathlib.Path(A + 'pillar_daynight.webp').stat().st_size // 1024, 'KB')
