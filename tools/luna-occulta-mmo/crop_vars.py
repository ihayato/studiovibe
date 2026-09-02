"""charbuildツール(2000x1100・--zoom=0.55・--hero-angle=4.9=正面やや斜め)の写しから被写体まわりを3:4で切り出し480x640 WebPへ。
使い方: python3 tools/luna-occulta-mmo/crop_vars.py <src_dir> <dst_dir>"""
import sys, pathlib, subprocess
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for p in sorted(src.glob('var_*.png')):
    im = Image.open(p).convert('RGB'); w, h = im.size; k = w / 2000
    # 被写体は画面中央（cx=1000）。左のUI(x<800)を避けて幅400・3:4（y 280..813）
    cw, ch = int(400 * k), int(533 * k); cx, cy = int(1000 * k), int(546 * k)
    crop = im.crop((cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2)).resize((480, 640), Image.LANCZOS)
    tmp = dst / (p.stem + '_c.png'); crop.save(tmp)
    out = dst / (p.stem + '.webp')
    subprocess.run(['cwebp', '-quiet', '-q', '82', str(tmp), '-o', str(out)], check=True); tmp.unlink()
    print(out.name, out.stat().st_size // 1024, 'KB')
