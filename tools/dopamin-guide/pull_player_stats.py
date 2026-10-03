#!/usr/bin/env python3
"""番付（kitan-clicker-banzuke の D1）から「第2000夜を越えた人」の集計を取り、player_stats.json に書く。

読むだけ（SELECT のみ）。頁には集計しか出さない＝端末ID・名乗り・顔は書き出さない。
  python3 tools/dopamin-guide/pull_player_stats.py [--clicker ~/Desktop/dev/kitan-clicker-wt-stats]
数え方:
  - 記録は submissions（受理された night の提出）。端末は今季の自己ベストを更新したときと、暁が増えたときに送る
  - 「始めてから」は 始めた日（start_at）・登録・最初の提出 のいちばん早い刻から
  - 暁＝送られた dawns（月蝕10回ごとに1つ。前の最深を越えない月蝕は数えない）＝月蝕の回数の下限は 暁×10
"""
import argparse
import collections
import datetime
import json
import statistics
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
GOAL = 2000
SQL = ("SELECT s.install, s.score, s.dawns, s.received_at, i.start_at, i.created_at "
       "FROM submissions s JOIN installs i ON i.install = s.install "
       "WHERE s.div = 'night' AND s.outcome = 'accepted' ORDER BY s.install, s.received_at")


def query(clicker):
    out = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kitan-clicker-banzuke', '--remote', '--json', '--command', SQL],
                         cwd=Path(clicker) / 'worker', capture_output=True, text=True, check=True).stdout
    return json.loads(out)[0]['results']


def med(xs):
    return statistics.median(xs) if xs else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clicker', default=str(Path.home() / 'Desktop/dev/kitan-clicker-wt-stats'))
    args = ap.parse_args()
    by = collections.defaultdict(list)
    for r in query(args.clicker):
        by[r['install']].append(r)

    def start(v):
        return min([v[0]['received_at'], v[0]['created_at']] + ([v[0]['start_at']] if v[0]['start_at'] else []))

    def first(v, night):
        return next((r for r in v if r['score'] >= night), None)

    best = {k: max(r['score'] for r in v) for k, v in by.items()}
    top = [k for k in by if best[k] >= GOAL]
    near = [k for k in by if 1500 <= best[k] < GOAL]
    reached = []
    for k in top:
        r = first(by[k], GOAL)
        reached.append({'days': round((r['received_at'] - start(by[k])) / 86400, 1), 'dawns': r['dawns']})
    reached.sort(key=lambda x: x['days'])
    # 同じ夜あたりで比べる: 第1500夜に届いた時点の暁（越えた人／まだの人）
    at1500 = {g: [first(by[k], 1500)['dawns'] for k in ks] for g, ks in (('top', top), ('near', near))}
    now_dawns = {g: [max(r['dawns'] for r in by[k]) for k in ks] for g, ks in (('top', top), ('near', near))}
    # いちばん深い人の歩み（暁が増えた夜）
    lead = max(top, key=lambda k: best[k]) if top else None
    walk, seen = [], -1
    for r in by[lead] if lead else []:
        if r['dawns'] > seen:
            seen = r['dawns']
            walk.append({'dawn': r['dawns'], 'night': r['score']})
    last = max(r['received_at'] for v in by.values() for r in v)
    data = {
        'asOf': datetime.datetime.fromtimestamp(last, datetime.timezone(datetime.timedelta(hours=9))).strftime('%Y-%m-%d %H:%M'),
        'goal': GOAL,
        'players': len(by),
        'count': {'1000': sum(b >= 1000 for b in best.values()), '1500': sum(b >= 1500 for b in best.values()), str(GOAL): len(top)},
        'reached': reached,
        'dawnsAt1500': {g: {'median': med(v), 'min': min(v, default=0), 'max': max(v, default=0)} for g, v in at1500.items()},
        'dawnsNow': {g: {'median': med(v), 'min': min(v, default=0), 'max': max(v, default=0)} for g, v in now_dawns.items()},
        'nearCount': len(near),
        'lead': {'best': best[lead] if lead else 0, 'walk': walk},
    }
    (HERE / 'player_stats.json').write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(f'player_stats.json: {data["asOf"]} 時点・{data["players"]}人・第{GOAL}夜越え {len(top)}人')


if __name__ == '__main__':
    main()
