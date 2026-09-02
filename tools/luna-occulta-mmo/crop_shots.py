"""検分レーンの写し(2560x1200)からHUD(上の場所名/右上RTT/左下チャット欄)を避けて
1600x750(16:7.5)のWebPへ。生成画への外科ではなく、写真のトリミング。
使い方: python3 tools/luna-occulta-mmo/crop_shots.py <src_dir> <dst_dir> [name=cx,cy ...]
  name=cx,cy … その画像の切り出し中心（原画ピクセル）。省略時は画像中心のやや上。"""
import sys, pathlib, subprocess
from PIL import Image

src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
dst.mkdir(parents=True, exist_ok=True)
centers = {}
for kv in sys.argv[3:]:
    k, v = kv.split('='); cx, cy = v.split(','); centers[k] = (int(cx), int(cy))
CW, CH = 1920, 900          # 切り出し寸法（16:7.5）
TOP, BOTTOM, SIDE = 120, 190, 40   # HUDの帯（場所名/チャット欄）を避ける
for p in sorted(src.glob('*.png')):
    im = Image.open(p).convert('RGB'); w, h = im.size
    cx, cy = centers.get(p.stem, (w // 2, (TOP + (h - BOTTOM)) // 2))
    x0 = min(max(cx - CW // 2, SIDE), w - SIDE - CW)
    y0 = min(max(cy - CH // 2, TOP), h - BOTTOM - CH)
    crop = im.crop((x0, y0, x0 + CW, y0 + CH))
    tmp = dst / (p.stem + '.png'); crop.save(tmp)
    out = dst / ('shot_' + p.stem + '.webp')
    subprocess.run(['cwebp', '-quiet', '-q', '80', '-resize', '1600', '0', str(tmp), '-o', str(out)], check=True)
    tmp.unlink(); print(f'{out.name} crop=({x0},{y0}) {out.stat().st_size // 1024}KB')
