"""OGP 1200x630。ロゴ(透過)を宵闇藍の地に置くだけの合成（生成画への外科ではない）。
使い方: python3 tools/luna-occulta-mmo/make_og.py <logo_crop.png>"""
import sys
from PIL import Image, ImageDraw, ImageFilter
logo = Image.open(sys.argv[1]).convert('RGBA')
W, H = 1200, 630
bg = Image.new('RGBA', (W, H), '#131320')
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
g.ellipse((W/2-460, H/2-300, W/2+460, H/2+300), fill=(92, 68, 112, 80))
glow = glow.filter(ImageFilter.GaussianBlur(90))
bg = Image.alpha_composite(bg, glow)
lw = 900; lh = round(logo.height * lw / logo.width)
logo = logo.resize((lw, lh), Image.LANCZOS)
bg.alpha_composite(logo, ((W - lw) // 2, (H - lh) // 2 - 14))
d = ImageDraw.Draw(bg)
d.line((W/2-140, H-72, W/2+140, H-72), fill=(217, 169, 76, 170), width=1)
bg.convert('RGB').save('public/luna-occulta-mmo-assets/og.jpg', quality=88, optimize=True)
print('og.jpg', bg.size)
