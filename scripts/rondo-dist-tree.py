#!/usr/bin/env python3
"""rondo-dist-tree.py — public/rondo.html の「買うと届くのは、このフォルダです。」を配布物の実物から書き出す。

使い方: python3 scripts/rondo-dist-tree.py <展開済み rondo-dist フォルダ> [--check]
  - <!-- dist-tree:begin --> 〜 <!-- dist-tree:end --> の間を丸ごと作り直す
  - --check は書き換えずに、今のLPと実物がずれていたら exit 1
ZIP を作り直したら必ず走らせる(手書きの数字が 08-12 版のまま2か月止まった反省・2026-10-07)。
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LP = ROOT / "public" / "rondo.html"

TOP_FILES = [
    ("README.md", "はじめかた"),
    ("AGENTS.md", "Codex が最初に読む入口"),
    ("SETUP.md", "AIが読む構築手順書"),
    ("AI_CONSTITUTION.md", "AI憲法。読者を守る掟"),
    ("EULA.md", "利用条件"),
]
DIRS = [
    ("src", "src", "エンジン本体。メール・LINE・予約・Instagram・管理画面", "", True),
    ("test", "test", "テスト一式。届いたその場で全部走る", "ok", False),
    ("mig", "migrations", "配信データベースの設計図", "", False),
    ("scr", "scripts", "配備・検証・健康診断・引っ越しのコマンド", "", False),
    ("con", "contents", "原稿サンプル", "", False),
    ("gui", "guides", "人が読むセットアップ・更新ガイド", "", False),
    ("ex", "examples", "登録フォームの見本", "", False),
    ("cl", ".claude", "診断AI「イケハヤAI」", "", False),
]


def files_under(base: Path, d: str):
    return sorted(str(p.relative_to(base / d)) for p in (base / d).rglob("*") if p.is_file())


def build(dist: Path) -> str:
    version = json.loads((dist / "package.json").read_text())["version"]
    out = []
    for name, desc in TOP_FILES:
        if not (dist / name).is_file():
            sys.exit(f"配布物に {name} が無い: {dist}")
        out.append(
            f'          <div class="dt-row"><span class="dt-tree" aria-hidden="true">├─</span><span class="dt-caret-pad"></span>'
            f'<span class="dt-name">{name}</span><span class="dt-fill" aria-hidden="true"></span><span class="dt-desc">{desc}</span></div>'
        )
    out.append("")
    total = sum(1 for p in dist.rglob("*") if p.is_file())
    for i, (key, d, desc, cls, opened) in enumerate(DIRS):
        names = files_under(dist, d)
        last = i == len(DIRS) - 1
        branch = "└─" if last else "├─"
        num = f"{len(names)} file" + ("" if len(names) == 1 else "s")
        tag = '<span class="dt-tag">あなたの原稿に差し替え</span>' if d == "contents" else ""
        dcls = f"dt-desc {cls}".strip()
        hidden = "" if opened else " hidden"
        spans = "".join(f"<span>{html.escape(n)}</span>" for n in names)
        out.append('          <div class="dt-node">')
        out.append(
            f'            <button class="dt-row" data-dir aria-expanded="{"true" if opened else "false"}" aria-controls="dt-ch-{key}" '
            f'data-rondo-label="同梱物ツリー {d.lstrip(".")}"><span class="dt-tree" aria-hidden="true">{branch}</span>'
            f'<span class="dt-caret" aria-hidden="true">▸</span><span class="dt-name dir">{d}/</span><span class="dt-num">{num}</span>'
            f'<span class="dt-fill" aria-hidden="true"></span><span class="{dcls}">{desc}</span>{tag}</button>'
        )
        out.append(f'            <div class="dt-children" id="dt-ch-{key}"{hidden}>')
        out.append(f"              {spans}")
        out.append("            </div>")
        out.append("          </div>")
        out.append("")
    out.append(
        f'          <div class="dt-total">合計 <b>{total:,}ファイル</b>・機能の間引きなし。'
        "秘密情報・広告SDK・外部への通信は入っていません。</div>"
    )
    body = "\n".join(out)
    cap = f'      <p class="dt-cap">v{version}（{date.today():%Y-%m-%d}）の実測です。ファイル数はzipを作り直すたびに実測で更新します。</p>'
    return body, cap


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dist = Path(sys.argv[1]).expanduser().resolve()
    check = "--check" in sys.argv
    body, cap = build(dist)
    text = LP.read_text()
    pat = re.compile(r"(<!-- dist-tree:begin -->)(.*?)(\n\s*<!-- dist-tree:end -->)", re.S)
    if not pat.search(text):
        sys.exit("rondo.html に dist-tree:begin/end の印が無い")
    new = pat.sub(lambda m: m.group(1) + "\n" + body + m.group(3), text, count=1)
    new = re.sub(r'      <p class="dt-cap">.*?</p>', cap, new, count=1)
    if check:
        same = re.sub(r"（\d{4}-\d{2}-\d{2}）", "", new) == re.sub(r"（\d{4}-\d{2}-\d{2}）", "", text)
        print("一致" if same else "ずれあり")
        sys.exit(0 if same else 1)
    LP.write_text(new)
    print(f"更新: {LP}")


if __name__ == "__main__":
    main()
