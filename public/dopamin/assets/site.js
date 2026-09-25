// どーぱみんクリッカー！公式サイト — 仲間の列・出入り・遅延再生・「ためし斬り」（ゲームの素材でつくる小さなクリッカー）
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 仲間30人（本編の名簿の名前・ゲームのカード絵） ----
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
    const html = list.map(([k, n]) => `<li><img src="assets/img/card/${k}.webp" alt="${n}" loading="lazy" width="360" height="540"><span>${n}</span></li>`).join("");
    ul.innerHTML = html + html.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"'); // 途切れず流れるように二周ぶん
  };
  fill("rail1", ROSTER.slice(0, 15));
  fill("rail2", ROSTER.slice(15));

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
  const POP = ".catch, .catch2, .sec-head h2, .try-side h2, .hochi h2 .big, .hochi h2 .sub2, .play-text h3, .play-text .no, .idle-list b, .hanko b, .closing .say, .sister h2, .soon b, .clock b";
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
    const u = [["京", 1e16], ["兆", 1e12], ["億", 1e8], ["万", 1e4]];
    for (const [s, v] of u) if (n >= v) return (n / v).toFixed(n / v < 10 ? 2 : n / v < 100 ? 1 : 0) + s;
    return Math.floor(n).toLocaleString("ja-JP");
  };
  const st = { night: 1, kill: 0, hp: 0, max: 0, coins: 0, combo: 0, lastTap: 0, boss: false, bossEnd: 0, mob: 0, busy: false };
  let comboTimer = 0, timerTick = 0;

  // 音（既定はオフ。押したときだけ読み込む）
  const se = {}; let soundOn = false, lastCoinSe = 0, atkI = 0;
  const load = () => { for (const k of ["se_atk_p0", "se_atk_p2", "se_atk_p4", "se_coin_p0", "se_doban"]) if (!se[k]) { se[k] = new Audio(`assets/audio/${k}.m4a`); se[k].preload = "auto"; } };
  const play = (k, vol = 0.5) => { if (!soundOn || !se[k]) return; const a = se[k].cloneNode(); a.volume = vol; a.play().catch(() => {}); };
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn; if (soundOn) load();
    soundBtn.textContent = soundOn ? "音：オン" : "音：オフ";
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  });

  const spawn = () => {
    st.boss = st.night % 10 === 0;
    const base = 12 * Math.pow(1.28, st.night - 1);
    st.max = st.hp = Math.round(base * (st.boss ? 8 : 1));
    st.mob = (st.mob + 1) % MOBS.length;
    foe.src = st.boss ? `assets/img/fx/anim_chapboss_${st.night % 20 === 0 ? "water" : "fire"}_idle.webp` : `assets/img/fx/anim_mob_${MOBS[st.mob]}_idle.webp`;
    foe.classList.toggle("boss", st.boss);
    hpBar.classList.toggle("boss", st.boss);
    hpFill.style.transform = "scaleX(1)";
    nightEl.textContent = `第${st.night}夜`;
    foe.animate([{ opacity: 0, transform: "translateY(-30%) scale(.9)" }, { opacity: 1, transform: "none" }], { duration: reduce ? 1 : 360, easing: "cubic-bezier(.22,.61,.36,1)" });
    clearInterval(timerTick);
    timerEl.style.display = st.boss ? "block" : "none";
    if (st.boss) {
      st.bossEnd = performance.now() + 30000;
      banner("大妖 見参！");
      play("se_doban", 0.5);
      const tick = () => {
        const left = Math.max(0, Math.ceil((st.bossEnd - performance.now()) / 1000));
        timerEl.textContent = `残り${left}秒`;
        if (left <= 0) { clearInterval(timerTick); banner("大妖は退いた…"); st.night = Math.max(1, st.night - 1); setTimeout(spawn, 900); }
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
      fx("coin", x, y, "assets/img/fx/koban.webp", [
        { transform: "translate(0,0) scale(1.4)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(1.6)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${tx - x}px,${ty - y}px) scale(.8)`, opacity: 0.9 },
      ], 700 + i * 60, "img");
    }
    setTimeout(() => coinsEl.lastChild.nodeValue = fmt(st.coins), 650);
  };

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

    // 斬撃・数字・揺れ
    const sl = SLASH[st.combo % SLASH.length];
    fx("slash", x, y, `assets/img/fx/fx_slash_${sl}.webp`, reduce ? [{ opacity: 1 }, { opacity: 0 }] : [
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
      comboEl.innerHTML = `${st.combo}<small>連</small>`;
      comboEl.getAnimations().forEach((a) => a.cancel());
      comboEl.style.opacity = 1;
      if (!reduce) comboEl.animate([{ transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 160 });
      if (st.combo === 100) banner("百連！"); else if (st.combo === 300) banner("三百連！"); else if (st.combo === 1000) banner("千連！！");
    }

    hpFill.style.transform = `scaleX(${Math.max(0, st.hp / st.max)})`;
    if (st.hp <= 0) kill();
  };

  const kill = () => {
    st.busy = true;
    const r = stage.getBoundingClientRect(), f = foe.getBoundingClientRect();
    const cx = f.left - r.left + f.width / 2, cy = f.top - r.top + f.height * 0.55;
    fx("burst", cx, cy, "assets/img/fx/fx_sumi_burst_a.webp", [{ opacity: 1, transform: "scale(.5)" }, { opacity: 0, transform: "scale(1.5)" }], 520, "img");
    foe.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.8)" }], { duration: 200, fill: "forwards" });
    const bonus = Math.round(st.max * (st.boss ? 2 : 0.8));
    st.coins += bonus;
    coinFly(cx, cy, st.boss ? 10 : 4);
    if (st.boss) { clearInterval(timerTick); banner("討伐！"); play("se_doban", 0.5); }
    st.kill++;
    if (st.boss || st.kill % 3 === 0) st.night++;
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
  stage.addEventListener("click", (e) => e.preventDefault());
  spawn();
})();
