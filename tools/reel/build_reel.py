"""トップの月窓リールを clips.txt から組む。
使い方: python3 tools/reel/build_reel.py  → public/studio/video/reel.mp4 と reel-poster.webp、site/reel.json（キャプション）
静止画は ゆっくり寄る（zoompan）。動画は開始秒から D 秒。クリップ間は X 秒のクロスフェード。"""
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PUB = os.path.join(ROOT, 'public')
D, X, SIZE, FPS = 1.6, 0.3, 720, 24
clips = [l.rstrip('\n').split('|') for l in open(os.path.join(HERE, 'clips.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
args, f = [], []
for k, (name, path, start, crop, title) in enumerate(clips):
    path = os.path.expanduser(path)
    if start == 'still':
        args += ['-i', path]
        n = int(D * FPS)
        f.append(f"[{k}:v]{crop},scale=1080:1080:flags=lanczos,zoompan=z='1+0.08*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={SIZE}x{SIZE}:fps={FPS},format=yuv420p,setsar=1,settb=AVTB,trim=duration={D}[v{k}]")
    else:
        args += ['-ss', start, '-t', str(D), '-i', path]
        f.append(f'[{k}:v]{crop},scale={SIZE}:{SIZE}:flags=lanczos,fps={FPS},format=yuv420p,setsar=1,settb=AVTB[v{k}]')
prev = 'v0'
for i in range(1, len(clips)):
    f.append(f'[{prev}][v{i}]xfade=transition=fade:duration={X}:offset={round(i * (D - X), 3)}[x{i}]')
    prev = f'x{i}'
out = os.path.join(PUB, 'studio/video/reel.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', ';'.join(f), '-map', f'[{prev}]', '-an',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '31', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
               check=True, cwd=PUB)
tmp = os.path.join(HERE, '_poster.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '0.5', '-i', out, '-frames:v', '1', tmp], check=True)
subprocess.run(['cwebp', '-quiet', '-q', '70', tmp, '-o', os.path.join(PUB, 'studio/video/reel-poster.webp')], check=True)
os.remove(tmp)
json.dump({'step': round(D - X, 3), 'titles': [c[4] for c in clips]},
          open(os.path.join(ROOT, 'site/reel.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(out, os.path.getsize(out), 'bytes', len(clips), 'clips')
