"""擬似キャラビルド用の写し(2000x1100・charbuild batch・zoom0.55・angle4.9)を
中央400x533で切り出し300x400のWebPへ。使い方: crop_build.py <src_dir> <dst_dir>"""
import sys, pathlib, subprocess
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
n=0
for p in sorted(src.glob('b_*.png')):
    out = dst / (p.stem + '.webp')
    if out.exists(): continue
    im = Image.open(p).convert('RGB'); w, h = im.size; k = w / 2000
    crop = im.crop((int(800*k), int(280*k), int(1200*k), int(813*k))).resize((300, 400), Image.LANCZOS)
    tmp = dst / (p.stem + '_c.png'); crop.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', '80', str(tmp), '-o', str(out)], check=True); tmp.unlink(); n+=1
print('converted', n, 'total', len(list(dst.glob('b_*.webp'))))
