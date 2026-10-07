set -e
cd ~/Desktop/dev/vibe-wt-rondo-v10
cp /private/tmp/claude-501/-Users-hayatoikeda-Desktop-dev-cn-kitan-wt-webpoc/8697ea86-6ed8-42e6-aef7-38f6022836bd/scratchpad/base.html public/rondo.html
python3 scripts/rondo-dist-tree.py ~/Desktop/dev/rondo-v10-finish/rondo/dist/rondo-dist >/dev/null
python3 /private/tmp/claude-501/-Users-hayatoikeda-Desktop-dev-cn-kitan-wt-webpoc/8697ea86-6ed8-42e6-aef7-38f6022836bd/scratchpad/build_lp.py >/dev/null
python3 /private/tmp/claude-501/-Users-hayatoikeda-Desktop-dev-cn-kitan-wt-webpoc/8697ea86-6ed8-42e6-aef7-38f6022836bd/scratchpad/build_v3.py
