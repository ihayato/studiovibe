// どぱくり！公式サイト — 仲間の列・出入り・遅延再生・「ためし斬り」（ゲームの素材でつくる小さなクリッカー）
// 10-09 英語版（/dopamin/en/・<html lang="en">）: 文字は T(日本語, 英語)・素材は B（en/ からは一つ上の assets/）
const EN = document.documentElement.lang === "en";
const B = EN ? "../" : "";
const T = (ja, en) => (EN ? en : ja);
const NAME_EN = {"emma": "Emma", "sakuya": "Sakuya", "oto": "Oto", "nemu": "Nemu", "izuna": "Izuna", "shion": "Shion", "uka": "Uka", "yui": "Yui", "karma": "Karma", "dan": "Dan", "shinra": "Shinra", "tobari": "Tobari", "tart": "Tart", "magoichi": "Magoichi", "rotton": "Rotton", "orochi": "Orochi", "aun": "Aun", "atoza": "Atoza", "nekomata": "Nekomata", "karura": "Karura", "kohaku": "Kohaku", "oen": "Oen", "janome": "Janome", "hinanojo": "Hinanojo", "naruka": "Naruka", "shiba": "Shiba", "benten": "Benten", "torika": "Torika", "xiaolan": "Xiaolan", "anne": "Anne", "sakuya_bancho": "Sakuya"};
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 月見台への経路（?via=）: 置き場所ごとに dopamin-<場所>。?via=x-0928 で来た人は dopamin-hero.x-0928 のように流入元を足して渡す ----
  const SLUG = /^[a-z0-9][a-z0-9._-]{0,47}$/;
  const inVia = (new URLSearchParams(location.search).get("via") || "").toLowerCase();
  document.querySelectorAll("a[data-via]").forEach((a) => {
    let v = `dopamin-${a.dataset.via}`;
    if (SLUG.test(inVia)) v = `${v}.${inVia}`.slice(0, 48).replace(/[._-]+$/, "");
    const u = new URL(a.href); u.searchParams.set("via", v); u.searchParams.set("utm_source", "dopamin"); a.href = u.toString();
  });
  // 10-03: Android もテスト版（Google Play）を配信中。スマホでは自分の機種のボタンだけ出し、パソコンでは両方を出す
  if (/Android/i.test(navigator.userAgent)) {
    document.body.classList.add("is-android");
  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)) {
    document.body.classList.add("is-ios");
  }

  // ---- 仲間の列（本編の名簿の名前・ゲームのカード絵） ----
  const ROSTER = [
    ["emma", "エマ"], ["sakuya", "咲耶"], ["oto", "於兎"], ["nemu", "ネム"], ["izuna", "イズナ"], ["shion", "紫苑"],
    ["uka", "宇迦"], ["yui", "結"], ["karma", "カルマ"], ["dan", "断"], ["shinra", "シンラ"], ["tobari", "トバリ"],
    ["tart", "タルト"], ["magoichi", "孫市"], ["rotton", "呂屯"], ["orochi", "オロチ"], ["aun", "アウン"], ["atoza", "アトザ"],
    ["nekomata", "猫又"], ["karura", "カルラ"], ["kohaku", "狐白"], ["oen", "おえん"], ["janome", "蛇ノ目"], ["hinanojo", "雛之丞"],
    ["naruka", "ナルカ"], ["shiba", "柴"], ["benten", "弁天"], ["torika", "酉花"], ["xiaolan", "シャオラン"], ["anne", "餡音"],
  ];
  const fill = (id, list) => {
    const ul = document.querySelector(`#${id} ul`);
    if (!ul) return;
    const html = list.map(([k, ja]) => { const n = EN ? (NAME_EN[k] || k) : ja; return `<li><img src="${B}assets/img/card/${k}.webp" alt="${n}" loading="lazy" width="360" height="540"><span>${n}</span></li>`; }).join("");
    ul.innerHTML = html + html.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"'); // 途切れず流れるように二周ぶん
  };
  fill("rail1", ROSTER); // 09-29: 2段目は「ちびの行進」に替えたので、札は1段に全員

  // ---- 出入り・画面に入った縦動画だけ再生 ----
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target.classList.contains("reveal")) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } continue; }
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === "none") { v.preload = "auto"; } v.play().catch(() => {}); } else v.pause();
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  // 念のため位置でも判定（IO が来ない環境で節が透明のまま残らないように）
  const revealCheck = () => { const H = innerHeight; document.querySelectorAll(".reveal:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < H * 0.92) el.classList.add("in"); }); };
  let rt = 0; addEventListener("scroll", () => { clearTimeout(rt); revealCheck(); rt = setTimeout(revealCheck, 90); }, { passive: true });
  setTimeout(revealCheck, 300);
  if (!reduce) document.querySelectorAll("video[data-lazy]").forEach((v) => io.observe(v));
  else document.querySelectorAll("video[data-lazy]").forEach((v) => { v.preload = "metadata"; v.controls = true; });
  const hero = document.getElementById("heroVideo");
  if (hero && reduce) { hero.pause(); hero.removeAttribute("autoplay"); }

  // ---- 文字のポップ（09-26 本人「スクロールで文字がポップする感じ」）----
  // 見出しを一文字ずつに割り、画面に入ったら跳ねて出す。跳ね終えたら元の組みに戻す（縁取りの重なりを残さない）。
  const POP = ".catch, .catch2, .sec-head h2, .try-side h2, .play-text h3, .play-text .no, .hanko b, .closing .say, .sister h2, .soon b, .clock b";
  if (!reduce) {
    const split = (node, st) => {
      for (const c of [...node.childNodes]) {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of c.textContent) {
            if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
            const sp = document.createElement("span");
            sp.className = "ch"; sp.textContent = ch; sp.style.setProperty("--k", st.n++);
            frag.appendChild(sp);
          }
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== "BR") split(c, st);
      }
    };
    // IntersectionObserver だけに頼らず、スクロールのたびに位置で判定する（見えない枠では IO が来ないことがある＝文字が消えたままにしない）
    const pending = new Set();
    const fire = (el) => {
      pending.delete(el);
      const n = Number(el.dataset.chn || 1), step = Math.min(42, 620 / n);
      el.style.setProperty("--step", `${step}ms`);
      el.classList.add("chgo");
      setTimeout(() => { if (el.dataset.chorig != null) { el.innerHTML = el.dataset.chorig; delete el.dataset.chorig; } el.classList.remove("chwait", "chgo"); }, n * step + 700);
    };
    let last = 0, trail = 0;
    const check = () => {
      const H = innerHeight;
      for (const el of pending) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0) { el.innerHTML = el.dataset.chorig; delete el.dataset.chorig; el.classList.remove("chwait"); pending.delete(el); } // 飛ばして過ぎた＝そのまま見せる
        else if (r.top < H * 0.9) fire(el);
      }
    };
    // rAF は裏のタブで止まるので使わない（止まると文字が隠れたままになる）。60ms に一度＋止まった後にもう一度
    const onScroll = () => { const t = Date.now(); if (t - last > 60) { last = t; check(); } clearTimeout(trail); trail = setTimeout(check, 90); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    document.querySelectorAll(POP).forEach((el) => {
      if (el.closest(".stage")) return;
      el.dataset.chorig = el.innerHTML;
      const label = el.textContent.trim();
      const wrap = document.createElement("span");
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML = el.innerHTML;
      const st = { n: 0 }; split(wrap, st);
      el.dataset.chn = st.n;
      el.innerHTML = "";
      const sr = document.createElement("span"); sr.className = "sr"; sr.textContent = label;
      el.append(sr, wrap);
      el.classList.add("chwait");
      pending.add(el);
    });
    check();
    setTimeout(check, 400);
  }

  // ---- ためし斬り ----
  const stage = document.getElementById("stage");
  if (!stage) return;
  const $ = (id) => document.getElementById(id);
  const foe = $("foe"), hpFill = $("hpFill"), hpBar = $("hp"), nightEl = $("night"), coinsEl = $("coins"), comboEl = $("combo"), bannerEl = $("banner"), timerEl = $("timer"), soundBtn = $("sound");
  const MOBS = ["water", "fire", "wood", "metal", "earth"];
  const SLASH = ["fire", "water", "wood"];
  const fmt = (n) => {
    const u = EN ? [["Q", 1e15], ["T", 1e12], ["B", 1e9], ["M", 1e6], ["K", 1e3]] : [["京", 1e16], ["兆", 1e12], ["億", 1e8], ["万", 1e4]];
    for (const [s, v] of u) if (n >= (EN && s === "K" ? 1e4 : v)) return (n / v).toFixed(n / v < 10 ? 2 : n / v < 100 ? 1 : 0) + s;
    return Math.floor(n).toLocaleString(EN ? "en-US" : "ja-JP");
  };
  const statusEl = $("tryStatus"), nextEl = $("tryNext"), nightOut = $("tryNight");
  const say = (t) => { if (statusEl) statusEl.textContent = t; };
  let bossDown = false;
  const offerNext = () => {
    if (!nextEl) return;
    if (nightOut) nightOut.textContent = st.night;
    if (!nextEl.hidden || !(bossDown || st.kill >= 8)) return;
    nextEl.hidden = false;
    say(T("続きはアプリで遊べます", "Keep playing in the app"));
  };
  const st = { night: 1, kill: 0, hp: 0, max: 0, coins: 0, combo: 0, lastTap: 0, boss: false, bossEnd: 0, mob: 0, busy: false };
  let comboTimer = 0, timerTick = 0;

  // 音（既定はオフ。押したときだけ読み込む）
  const se = {}; let soundOn = false, lastCoinSe = 0, atkI = 0;
  const load = () => { for (const k of ["se_atk_p0", "se_atk_p2", "se_atk_p4", "se_coin_p0", "se_doban"]) if (!se[k]) { se[k] = new Audio(`${B}assets/audio/${k}.m4a`); se[k].preload = "auto"; } };
  const play = (k, vol = 0.5) => { if (!soundOn || !se[k]) return; const a = se[k].cloneNode(); a.volume = vol; a.play().catch(() => {}); };
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn; if (soundOn) load();
    soundBtn.textContent = soundOn ? T("音：オン", "Sound: On") : T("音：オフ", "Sound: Off");
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  });

  const spawn = () => {
    st.boss = st.night % 10 === 0;
    const base = 12 * Math.pow(1.28, st.night - 1);
    st.max = st.hp = Math.round(base * (st.boss ? 8 : 1));
    st.mob = (st.mob + 1) % MOBS.length;
    foe.src = st.boss ? `${B}assets/img/fx/anim_chapboss_${st.night % 20 === 0 ? "water" : "fire"}_idle.webp` : `${B}assets/img/fx/anim_mob_${MOBS[st.mob]}_idle.webp`;
    foe.classList.toggle("boss", st.boss);
    hpBar.classList.toggle("boss", st.boss);
    hpFill.style.transform = "scaleX(1)";
    nightEl.textContent = T(`第${st.night}夜`, `Night ${st.night}`);
    foe.animate([{ opacity: 0, transform: "translateY(-30%) scale(.9)" }, { opacity: 1, transform: "none" }], { duration: reduce ? 1 : 360, easing: "cubic-bezier(.22,.61,.36,1)" });
    clearInterval(timerTick);
    timerEl.style.display = st.boss ? "block" : "none";
    if (st.boss) {
      st.bossEnd = performance.now() + 30000;
      banner(T("大妖 見参！", "BOSS!")); say(T(`第${st.night}夜、大妖が現れた。刻限は30秒`, `Night ${st.night}: a Boss appears. 30 seconds!`));
      play("se_doban", 0.5);
      const tick = () => {
        const left = Math.max(0, Math.ceil((st.bossEnd - performance.now()) / 1000));
        timerEl.textContent = T(`残り${left}秒`, `${left}s left`);
        if (left <= 0) { clearInterval(timerTick); st.busy = true; banner(T("大妖は退いた…", "The Boss escaped…")); say(T("大妖は退いた", "The Boss escaped")); st.night = Math.max(1, st.night - 1); setTimeout(() => { st.busy = false; spawn(); }, 900); }
      };
      tick(); timerTick = setInterval(tick, 250);
    }
  };

  const banner = (text) => {
    bannerEl.textContent = text;
    bannerEl.animate(reduce ? [{ opacity: 1 }, { opacity: 0 }] : [
      { opacity: 0, transform: "translate(-50%,-50%) scale(2.2) rotate(-6deg)" },
      { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-3deg)", offset: 0.18 },
      { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-3deg)", offset: 0.75 },
      { opacity: 0, transform: "translate(-50%,-60%) scale(.9) rotate(-3deg)" },
    ], { duration: 1300, easing: "cubic-bezier(.22,.61,.36,1)" });
  };

  const fx = (cls, x, y, html, anim, dur, tag = "div") => {
    const el = document.createElement(tag);
    el.className = `fx ${cls}`;
    if (tag === "img") el.src = html; else el.textContent = html;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    stage.appendChild(el);
    el.animate(anim, { duration: dur, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" }).onfinish = () => el.remove();
    return el;
  };

  const coinFly = (x, y, n) => {
    const r = stage.getBoundingClientRect(), c = coinsEl.getBoundingClientRect();
    const tx = c.left - r.left + 14, ty = c.top - r.top + c.height / 2;
    for (let i = 0; i < n; i++) {
      const dx = (Math.random() - 0.5) * 90, dy = -30 - Math.random() * 60;
      fx("coin", x, y, `${B}assets/img/fx/koban.webp`, [
        { transform: "translate(0,0) scale(1.4)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(1.6)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${tx - x}px,${ty - y}px) scale(.8)`, opacity: 0.9 },
      ], 700 + i * 60, "img");
    }
  };
  const syncCoins = () => { coinsEl.lastChild.nodeValue = fmt(st.coins); };

  const hit = (x, y) => {
    if (st.busy) return;
    stage.classList.add("played");
    const now = performance.now();
    st.combo = now - st.lastTap < 1400 ? st.combo + 1 : 1;
    st.lastTap = now;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => { st.combo = 0; comboEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }); }, 1400);

    const crit = Math.random() < 0.12 + Math.min(0.25, st.combo / 400);
    const dmg = Math.max(1, Math.round((2 + st.night * 0.9) * (1 + st.combo / 40) * (crit ? 3 : 1) * Math.pow(1.22, st.night - 1)));
    st.hp -= dmg;
    const gain = Math.max(1, Math.round(dmg * 0.6));
    st.coins += gain;
    syncCoins();

    // 斬撃・数字・揺れ
    const sl = SLASH[st.combo % SLASH.length];
    fx("slash", x, y, `${B}assets/img/fx/fx_slash_${sl}.webp`, reduce ? [{ opacity: 1 }, { opacity: 0 }] : [
      { opacity: 0, transform: `rotate(${Math.random() * 360}deg) scale(.6)` },
      { opacity: 1, transform: `rotate(${Math.random() * 360}deg) scale(1.1)`, offset: 0.25 },
      { opacity: 0, transform: "scale(1.25)" },
    ], 260, "img");
    fx(`num${crit ? " crit" : ""}`, x + (Math.random() - 0.5) * 40, y - 20, fmt(dmg) + (crit ? "!" : ""), [
      { opacity: 0, transform: "translate(-50%,0) scale(.6)" },
      { opacity: 1, transform: "translate(-50%,-26px) scale(1.15)", offset: 0.2 },
      { opacity: 0, transform: "translate(-50%,-70px) scale(1)" },
    ], 760);
    if (!reduce) {
      foe.animate([{ transform: "translateX(0)" }, { transform: "translateX(6%) rotate(3deg)" }, { transform: "translateX(-2%)" }, { transform: "none" }], { duration: 180 });
      document.querySelector(".stage .ally").animate([{ transform: "none" }, { transform: "translateX(38%) scale(1.04)" }, { transform: "none" }], { duration: 240, composite: "add" });
    }
    foe.classList.add("hit"); setTimeout(() => foe.classList.remove("hit"), 90);
    if (Math.random() < 0.55) coinFly(x, y, crit ? 3 : 1);
    play(["se_atk_p0", "se_atk_p2", "se_atk_p4"][atkI++ % 3], 0.35);
    if (now - lastCoinSe > 250) { play("se_coin_p0", 0.25); lastCoinSe = now; }

    // 連打の数
    if (st.combo >= 2) {
      comboEl.innerHTML = `${st.combo}<small>${T("連", " Combo")}</small>`;
      comboEl.getAnimations().forEach((a) => a.cancel());
      comboEl.style.opacity = 1;
      if (!reduce) comboEl.animate([{ transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 160 });
      if (st.combo === 100) banner(T("百連！", "100 Combo!")); else if (st.combo === 300) banner(T("三百連！", "300 Combo!")); else if (st.combo === 1000) banner(T("千連！！", "1,000 Combo!!"));
    }

    hpFill.style.transform = `scaleX(${Math.max(0, st.hp / st.max)})`;
    if (st.hp <= 0) kill();
  };

  const kill = () => {
    st.busy = true;
    const r = stage.getBoundingClientRect(), f = foe.getBoundingClientRect();
    const cx = f.left - r.left + f.width / 2, cy = f.top - r.top + f.height * 0.55;
    fx("burst", cx, cy, `${B}assets/img/fx/fx_sumi_burst_a.webp`, [{ opacity: 1, transform: "scale(.5)" }, { opacity: 0, transform: "scale(1.5)" }], 520, "img");
    foe.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.8)" }], { duration: 200, fill: "forwards" });
    const bonus = Math.round(st.max * (st.boss ? 2 : 0.8));
    st.coins += bonus;
    syncCoins();
    coinFly(cx, cy, st.boss ? 10 : 4);
    if (st.boss) { clearInterval(timerTick); banner(T("討伐！", "DEFEATED!")); say(T("大妖を討伐した", "You defeated the Boss")); play("se_doban", 0.5); bossDown = true; }
    st.kill++;
    if (st.boss || st.kill % 3 === 0) st.night++;
    offerNext();
    setTimeout(() => { foe.getAnimations().forEach((a) => a.cancel()); st.busy = false; spawn(); }, st.boss ? 900 : 380);
  };

  stage.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    hit(e.clientX - r.left, e.clientY - r.top);
  });
  stage.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const r = stage.getBoundingClientRect(), f = foe.getBoundingClientRect();
    hit(f.left - r.left + f.width / 2 + (Math.random() - 0.5) * 30, f.top - r.top + f.height / 2);
  });
  stage.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.detail !== 0) return; // 指・マウスは pointerdown で処理済み
    const r = stage.getBoundingClientRect(), f = foe.getBoundingClientRect();
    hit(f.left - r.left + f.width / 2, f.top - r.top + f.height / 2);
  });
  spawn();
})();

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- ちびの行進（09-29）: コマ帯を CSS steps() で回す。見えている帯だけ .live＝画面外では止まる ----
  const WALK = { emma: [12, 55], sakuya: [11, 68], oto: [12, 47], uka: [16, 54], nemu: [13, 53], yui: [13, 38], shion: [13, 51], izuna: [14, 53], tart: [15, 83], nekomata: [15, 80], kohaku: [13, 41], karura: [15, 49], sakuya_bancho: [21, 64] }; // [コマ数, 表示幅px]
  const WNAME = { emma: "エマ", sakuya: "咲耶", oto: "於兎", uka: "宇迦", nemu: "ネム", yui: "結", shion: "紫苑", izuna: "イズナ", tart: "タルト", nekomata: "猫又", kohaku: "狐白", karura: "カルラ", sakuya_bancho: "花見番長" };
  const WH = 96, FRAME = 90, GAP = 34;
  const walker = (id, i, named) => {
    const [n, w] = WALK[id];
    const el = document.createElement("div");
    el.className = "walker"; el.dataset.id = id; el.style.width = `${w}px`;
    el.innerHTML = `<div class="wb"><i class="wsh"></i><div class="wsp" style="width:${w}px;height:${WH}px"><img data-src="${B}assets/img/walk/${id}.webp" alt="" width="${w * n}" height="${WH}" style="width:${w * n}px;height:${WH}px;--n:${n};--dur:${n * FRAME}ms;--ph:-${((i * 37) % n) * FRAME}ms"></div></div>${named ? `<span class="wname">${EN ? (NAME_EN[id] || id) : WNAME[id]}</span>` : ""}`;
    return el;
  };
  const bands = [...document.querySelectorAll(".band[data-walk]")];
  bands.forEach((band) => {
    const ids = band.dataset.walk.split(",");
    const named = band.hasAttribute("data-names");
    if (band.classList.contains("band-hero")) {
      const troop = band.querySelector(".troop");
      ids.forEach((id, i) => { const el = walker(id, i, named); el.style.transitionDelay = `${(ids.length - 1 - i) * 120}ms`; troop.appendChild(el); });
      return;
    }
    const track = band.querySelector(".track");
    const unit = ids.reduce((a, id) => a + WALK[id][1] + GAP, 0);
    const reps = Math.max(1, Math.ceil(Math.max(innerWidth, 400) / unit)); // PC の広い画面でも途切れないように顔ぶれを繰り返す（スマホは1周）
    for (let copy = 0; copy < reps * 2; copy++) ids.forEach((id, i) => track.appendChild(walker(id, i + copy * 3, named)));
    const half = unit * reps;
    track.style.setProperty("--mdur", `${(half / (50 * (parseFloat(band.dataset.speed) || 1))).toFixed(2)}s`);
  });
  // 近づいたら読み込み（全帯を最初から持たない）
  const loadBand = (band) => { if (band.dataset.loaded) return; band.dataset.loaded = 1; band.querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); }); };
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { loadBand(e.target); near.unobserve(e.target); } }), { rootMargin: "600px 0px" });
  const live = new IntersectionObserver((es) => es.forEach((e) => {
    e.target.classList.toggle("live", e.isIntersecting && !document.hidden && !reduce);
    if (e.isIntersecting) { loadBand(e.target); e.target.classList.add("entered"); }
  }), { rootMargin: "0px 0px -8% 0px" });
  bands.forEach((b) => { near.observe(b); live.observe(b); });
  // IO が来ない枠もあるので（既存の reveal と同じ理由）、スクロールのたびに位置でも判定する
  const tick = () => bands.forEach((b) => {
    const r = b.getBoundingClientRect(), H = innerHeight;
    if (r.top < H + 600 && r.bottom > -600) loadBand(b);
    const vis = r.top < H * 0.92 && r.bottom > 0;
    if (vis) b.classList.add("entered");
    b.classList.toggle("live", vis && !document.hidden && !reduce);
  });
  let wt = 0, wl = 0;
  addEventListener("scroll", () => { const t = Date.now(); if (t - wl > 120) { wl = t; tick(); } clearTimeout(wt); wt = setTimeout(tick, 120); }, { passive: true });
  addEventListener("resize", tick);
  setTimeout(tick, 300);
  document.addEventListener("visibilitychange", () => { if (document.hidden) bands.forEach((b) => b.classList.remove("live")); else bands.forEach((b) => { const r = b.getBoundingClientRect(); if (!reduce && r.bottom > 0 && r.top < innerHeight) b.classList.add("live"); }); });
  // タップ: 跳ねる＋吹き出し（名前か「小判！」）＋小判1枚
  let bubAlt = 0;
  const hop = (el) => {
    const body = el.querySelector(".wb");
    if (body.dataset.busy) return; body.dataset.busy = 1;
    if (!reduce) {
      body.animate([{ transform: "none" }, { transform: "scale(1.08,.9)", offset: .12 }, { transform: "translateY(-30px) scale(.94,1.08)", offset: .45 }, { transform: "scale(1.1,.9)", offset: .82 }, { transform: "none" }], { duration: 520, easing: "ease-out" });
      el.querySelector(".wsh").animate([{ transform: "none" }, { transform: "scale(.6)", offset: .45 }, { transform: "none" }], { duration: 520 });
    }
    const b = document.createElement("span"); b.className = "wbub"; b.textContent = (bubAlt++ % 2) ? T("小判！", "Gold!") : (EN ? (NAME_EN[el.dataset.id] || el.dataset.id) : WNAME[el.dataset.id]); el.appendChild(b);
    b.animate([{ opacity: 0, transform: "translate(-50%,6px) scale(.7)" }, { opacity: 1, transform: "translate(-50%,0) scale(1)", offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0, transform: "translate(-50%,-6px)" }], { duration: 1300, easing: "ease-out" }).onfinish = () => b.remove();
    if (!reduce) {
      const k = document.createElement("img"); k.className = "wkoban"; k.src = `${B}assets/img/fx/koban.webp`; k.alt = ""; k.style.left = "50%"; k.style.bottom = "60%"; el.appendChild(k);
      const dx = (Math.random() - .5) * 50;
      k.animate([{ transform: "translate(-50%,0) rotate(0) scale(.5)", opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),-54px) rotate(200deg) scale(1)`, opacity: 1, offset: .45 }, { transform: `translate(calc(-50% + ${dx * 1.4}px),10px) rotate(420deg) scale(.9)`, opacity: 0 }], { duration: 760, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => k.remove();
    }
    setTimeout(() => delete body.dataset.busy, 540);
  };
  bands.forEach((band) => band.addEventListener("click", (e) => { const w = e.target.closest(".walker"); if (w) hop(w); }));

  // ---- 主ボタン（ヒーロー・締めの2つだけ）: 初めて見えた時に1回だけ光・押すと小判 ----
  const mains = [".hero .cta", ".closing .cta"].map((sel) => { const box = document.querySelector(sel); return box && [...box.querySelectorAll(".btn")].find((b) => b.offsetParent !== null); }).filter(Boolean);
  const shineIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { shineIO.unobserve(e.target); if (!reduce) setTimeout(() => e.target.classList.add("shine"), 250); } }), { threshold: .8 });
  mains.forEach((b) => { b.classList.add("shiny"); shineIO.observe(b); });
  mains.forEach((b) => b.addEventListener("pointerdown", () => {
    if (reduce) return;
    const box = b.parentElement; if (getComputedStyle(box).position === "static") box.style.position = "relative";
    const r = b.getBoundingClientRect(), pr = box.getBoundingClientRect();
    for (let j = 0; j < 3; j++) {
      const k = document.createElement("img"); k.className = "wkoban"; k.src = `${B}assets/img/fx/koban.webp`; k.alt = "";
      k.style.left = `${r.left - pr.left + r.width / 2}px`; k.style.top = `${r.top - pr.top}px`; box.appendChild(k);
      const dx = (j - 1) * 46 + (Math.random() - .5) * 16;
      k.animate([{ transform: "translate(-50%,0) scale(.5)", opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px),-58px) rotate(${180 + j * 60}deg) scale(1)`, opacity: 1, offset: .45 }, { transform: `translate(calc(-50% + ${dx * 1.3}px),6px) rotate(${400 + j * 60}deg) scale(.9)`, opacity: 0 }], { duration: 720 + j * 60, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => k.remove();
    }
  }));
})();
