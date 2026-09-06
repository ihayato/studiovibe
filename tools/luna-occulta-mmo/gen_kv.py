#!/usr/bin/env python3
"""月蝕綺譚ONLINE 公式LPのサムネ（KV）発注 — fal gpt-image-2/edit・正典シート参照（2026-09-06）。

掟（feedback_kv_generation_canon_sheets）: 立ち絵の貼り込みではなく、正典シートを参照に
「新規の構図・演技・光」で描かせる。シートの棒立ちを写さない。ロゴは後合成（字形保証）。
出力: scratchpad/kv/kv_{A,B}.png（1536x1024・quality medium）。採用後にロゴを重ねて og.jpg へ。
"""
import json, sys, time, urllib.request
from pathlib import Path

CANON = Path("/Users/hayatoikeda/Desktop/dev/cn-kitan-web/public/media/img/canon")
TITLE_SHOT = Path("/Users/hayatoikeda/Desktop/dev/vibe/public/luna-occulta-mmo-assets/world_title.webp")
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/private/tmp/claude-501/-Users-hayatoikeda-Desktop-main/c1c9cd87-a008-442b-9608-8b70aa603231/scratchpad/kv")
KEY = Path("/Users/hayatoikeda/Desktop/dev/poki/susume-ninja/tools/.fal_key").read_text().strip()
EDIT_EP = "https://queue.fal.run/fal-ai/gpt-image-2/edit"
SPIRITS = ["sakuya", "izuna", "karura", "shion", "hinanojo", "oen"]

FLAT = (
    " ART STYLE (CRITICAL): flat 2D Japanese TV-anime cel art, like a key visual of a "
    "high-end anime. Large simple color shapes; each area is ONE uniform flat tone plus "
    "at most one hard-edged darker shadow tone. Clean crisp lineart, simplified detail. "
    "STRICTLY NO photorealistic rendering, NO painterly brushwork, NO canvas or paper "
    "texture, NO grain, NO noise, NO CG-render lighting, NO bloom. A gentle gradient is "
    "allowed in the sky only. Deep indigo night palette; warm orange paper-lantern light "
    "and aged-gold sparkles are the only warm accents. "
)
CHARS = (
    " CHARACTERS: the six girls from the reference character sheets, drawn EXACTLY as "
    "designed (hair, eyes, outfit, accessories, ears/tail where present) — but in "
    "BRAND-NEW poses and acting; do NOT copy the standing pose of the sheets. "
    "Reference 1 = Sakuya (black ponytail with red ribbon, pink kunoichi outfit, katana). "
    "Reference 2 = Izuna (fox ears and tail, black hair with blue tips, white and red miko robe). "
    "Reference 3 = Karura (black wings, dark robe, golden phoenix staff). "
    "Reference 4 = Shion (dark blue-teal short kimono, fur collar, red-brown ponytail, kunai). "
    "Reference 5 = Hinanojo (blonde bob, gold crown ornament, yellow kimono, carries a black ball). "
    "Reference 6 = Oen (green hair, cat ears and tail, glasses, orange haori over green, wooden backpack). "
    "Reference 7 = the game's title screen: use it ONLY for the setting — a stone approach path "
    "lit by stone lanterns leading to a red torii gate at night. Do NOT copy its logo or text. "
)
LOCK = (
    " MOON LOCK: in the sky, one large ECLIPSED moon — a black disc with a thin crimson-and-gold "
    "corona ring (a lunar eclipse), not a full moon, not a crescent. "
    " STRICT: no text, no letters, no logo, no watermark, no UI. Exactly six girls, no extra "
    "people, correct number of hands and ears. Wide 3:2 landscape composition. "
)

JOBS = {
    "A": (
        "kv_A.png",
        "COMPOSITION 'the invitation': a wide low-angle shot on the lantern-lit stone approach path "
        "at night, the red torii gate and a village of glowing paper lanterns behind. The six girls "
        "walk toward the viewer as a group, mid-stride, relaxed and confident like adventurers "
        "heading out for a night hunt. Sakuya is in front, slightly right of center, half turned "
        "back toward the viewer with a bright grin, extending an open hand to invite the viewer "
        "along. Izuna beside her smiles softly; Karura walks calmly with her staff; Shion in the "
        "back with a cool sideways glance; Hinanojo hugging her ball with a cheerful laugh; Oen "
        "adjusting her glasses with a wry smile. Keep the LEFT third of the frame mostly open "
        "night sky and lantern glow with no characters (space reserved for a logo). Gold "
        "particles drifting like fireflies. Eclipsed moon high in the upper right.",
    ),
    "B": (
        "kv_B.png",
        "COMPOSITION 'the night raid': the six girls stand shoulder to shoulder on the stone path "
        "in front of the red torii, weapons drawn, facing a colossal shadowed oni (only its huge "
        "horned silhouette and two glowing crimson eyes loom in the dark mist behind the torii, "
        "far bigger than the gate). Dynamic heroic line-up seen from a slightly low angle: Sakuya "
        "center drawing her katana with a fierce smile, Izuna raising a paper talisman, Karura's "
        "wings spread with the phoenix staff glowing gold, Shion crouched low with kunai, Hinanojo "
        "holding her ball forward bravely, Oen at the edge with a determined smirk. Strong rim "
        "light from the lanterns, crimson eclipse glow from above. Keep the LEFT quarter of the "
        "frame darker and emptier (space reserved for a logo).",
    ),
}


def api(url, body=None):
    req = urllib.request.Request(url, headers={"Authorization": f"Key {KEY}", "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(req, timeout=180) as r:
        t = r.read(); return json.loads(t) if t else {}


def upload(path: Path, ctype: str):
    init = api("https://rest.alpha.fal.ai/storage/upload/initiate", {"file_name": path.name, "content_type": ctype})
    put = urllib.request.Request(init["upload_url"], method="PUT", data=path.read_bytes(), headers={"Content-Type": ctype})
    with urllib.request.urlopen(put, timeout=180):
        pass
    return init["file_url"]


def run(job):
    out_name, comp = JOBS[job]
    refs = [upload(CANON / f"{s}_sheet.webp", "image/webp") for s in SPIRITS] + [upload(TITLE_SHOT, "image/webp")]
    prompt = comp + CHARS + FLAT + LOCK
    res = api(EDIT_EP, {"prompt": prompt, "image_urls": refs, "image_size": {"width": 1536, "height": 1024},
                        "quality": "medium", "output_format": "png", "num_images": 1})
    su, ru = res["status_url"], res["response_url"]
    deadline = time.time() + 900
    while time.time() < deadline:
        time.sleep(10)
        st = api(su)
        if st["status"] == "COMPLETED":
            out = api(ru); url = out["images"][0]["url"]
            data = urllib.request.urlopen(url, timeout=300).read()
            OUT.mkdir(parents=True, exist_ok=True); (OUT / out_name).write_bytes(data)
            print(f"saved {out_name} ({len(data) // 1024}KB)", flush=True); return
        if st["status"] not in ("IN_QUEUE", "IN_PROGRESS"):
            raise RuntimeError(f"{job}: {st}")
    raise RuntimeError(f"{job}: timeout")


if __name__ == "__main__":
    jobs = [j for j in sys.argv[2:]] or list(JOBS)
    for j in jobs:
        print(f"--- {j} ---", flush=True)
        if (OUT / JOBS[j][0]).exists():
            print("skip (exists)", flush=True); continue
        run(j)
