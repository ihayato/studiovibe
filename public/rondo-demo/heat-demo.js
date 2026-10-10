// Rondo の計測スクリプト(heat-client.mjs)の写し。デモでは閲覧モードだけを使う(見本のLPがデータの取得を中で返す)
(function () {
  'use strict';
  var sc = document.currentScript;
  if (!sc) return;
  // 同じページで2回読まれても二重に数えない
  if (window.__rondoHeat) return;
  window.__rondoHeat = 1;
  var PAGE = sc.getAttribute('data-page') || '';
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(PAGE)) return;
  var BASE = '';
  try { BASE = new URL(sc.src).origin; } catch (e) { return; }
  var GRID = 20;
  var SP_MAX = parseInt(sc.getAttribute('data-sp-max') || '', 10);
  if (!(SP_MAX >= 320 && SP_MAX <= 2000)) SP_MAX = 767;
  // 訪問の間引き(data-sample="0.25" なら4人に1人だけ計測し、受け口がその4倍に数える・最大10人に1人)。
  // 訪問の多い LP で1日の書き込みの上限に昼のうちに達し、遅い時間の訪問だけが欠けるのを防ぐ
  var SAMPLE = 1;
  var sampleRate = parseFloat(sc.getAttribute('data-sample') || '');
  if (sampleRate > 0 && sampleRate < 1) SAMPLE = Math.min(10, Math.max(1, Math.round(1 / sampleRate)));
  var SAMPLED_OUT = SAMPLE > 1 && Math.random() >= 1 / SAMPLE;
  function widthKey() { return window.innerWidth <= SP_MAX ? 'sp' : 'pc'; }
  var W = widthKey();
  function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }

  var hash = location.hash || '';
  var tokenMatch = hash.match(/rondoheat=([a-z0-9][a-z0-9-]*[.][0-9]+(?:[.][0-9a-f]{16})?[.][0-9a-f]{64})/);
  if (tokenMatch) {
    store(function (ls) { ls.setItem('rondoheat_off', '1'); });
    viewer(tokenMatch[1]);
    return;
  }
  var optMatch = hash.match(/rondoheat=(off|on)/);
  if (optMatch && optMatch[1] === 'off') { store(function (ls) { ls.setItem('rondoheat_off', '1'); }); return; }
  if (optMatch && optMatch[1] === 'on') store(function (ls) { ls.removeItem('rondoheat_off'); });
  if (store(function (ls) { return ls.getItem('rondoheat_off'); }) === '1') return;
  if (navigator.webdriver || new RegExp('bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|facebookexternalhit|embedly|bingpreview|inspectiontool|ptst|phantom|puppeteer|playwright|selenium|python|curl|wget|go-http', 'i').test(navigator.userAgent || '')) return;

  // ================= 計測モード =================
  var IDLE_MS = 30000;          // 操作がこれだけ止まったら滞在を打ち切る(打ち切りは「最後の操作＋30秒」)
  var SEC_CAP_MS = 1800000;     // 1訪問×1区画の滞在の上限(ページの滞在と同じ30分。打ち切りの本体は「最後の操作＋30秒」)
  var ACTIVE_CAP_MS = 1800000;  // 1訪問のページ滞在の上限
  var TICK_MS = 5000;
  var SEND_EVERY_MS = 30000;    // 表示中もこの間隔で、ここまでの時間を締めて送る
  var MAX_EVENTS = 60;          // 受け口は1リクエスト80行までしか書かない
  var MAX_BYTES = 16000;
  var MAX_PENDING = 50;          // 届いたと確かめられていない固まり(送信中を含む)。回数では捨てない
  var RETRY_DAYS_MS = 7 * 86400000; // これより古い固まりは送り直さない(受け口は番号を8日持つ)
  var MAX_TRIES = 8;               // fetch での送り直しはこの回数まで(1回目は次の定期送信・以後15〜30秒から倍々・30分で頭打ち・揺らぎつき)
  var BACKOFF_MS = 30000, BACKOFF_MAX_MS = 1800000;
  var T0 = Date.now();
  var started = false;
  // 送信の固まりの番号(送り直しの重複を受け口で外すため)。ページを開くたびに作り直す使い捨ての乱数で、人は特定しない
  var VID = Math.random().toString(36).slice(2, 10);
  var seq = 0;

  var secEls = [];
  var secNames = [];
  var secIdx = {};
  function scanSecs() {
    secEls = [].slice.call(document.querySelectorAll('[data-sec]'));
    secNames = secEls.map(function (el) { return el.getAttribute('data-sec'); });
    secIdx = {};
    secNames.forEach(function (name, i) { if (!(name in secIdx)) secIdx[name] = i; });
  }
  function secsChanged() {
    var els = document.querySelectorAll('[data-sec]');
    if (els.length !== secEls.length) return true;
    for (var i = 0; i < els.length; i += 1) {
      if (els[i] !== secEls[i] || els[i].getAttribute('data-sec') !== secNames[i]) return true;
    }
    return false;
  }
  scanSecs();

  // 手元の溜め(送る前の集計)。区分(sp/pc)ごとに分けて持ち、固まりにするときも混ぜない
  var qs = {};
  function add(kind, sec, sel, gx, gy, n, v) {
    var q = qs[W] || (qs[W] = {});
    var key = kind + '\t' + sec + '\t' + sel + '\t' + gx + '\t' + gy;
    var cur = q[key];
    if (cur) { cur.n += n; cur.v += v; }
    else q[key] = { kind: kind, sec: sec, sel: sel, gx: gx, gy: gy, n: n, v: v };
  }
  function addAll(events) {
    events.forEach(function (e) { add(e.kind, e.sec, e.sel, e.gx, e.gy, e.n, e.v); });
  }

  // 送信は「区分(w)・開始時刻・番号つきの固まり」単位。作った固まりは中身を変えずに送り直す
  // (区分をまたいだ後に送り直しても、元の区分のまま届く)
  var pending = [];
  function packets(events, w) {
    var out = [], cur = [], size = 0;
    events.forEach(function (e) {
      var len = JSON.stringify(e).length + 1;
      if (cur.length && (cur.length >= MAX_EVENTS || size + len > MAX_BYTES)) { out.push(cur); cur = []; size = 0; }
      cur.push(e); size += len;
    });
    if (cur.length) out.push(cur);
    return out.map(function (evs) {
      seq += 1;
      return { page: PAGE, url: location.origin + location.pathname, w: w, t0: T0, bid: VID + '-' + seq, events: evs, tries: 0, made: Date.now() };
    });
  }
  function bodyOf(p, viaFetch) {
    var b = { page: p.page, url: p.url, w: p.w, t0: p.t0, bid: p.bid, events: p.events };
    if (SAMPLE > 1) b.s = SAMPLE;
    // fetch で送った固まりは受け口が番号を覚え、同じ番号の2回目は書かない
    if (viaFetch) b.f = 1;
    return JSON.stringify(b);
  }
  // pending＝届いたと確かめられていない固まり。fetch を始めた時点で入れ、2xx が返ったら外す(送信中も未達として数える)。
  // 先に作った固まりから入るので、上限で捨てるのは後から来た分(最初の固まり=訪問の分母を失わない)
  function done(p) {
    var i = pending.indexOf(p);
    if (i >= 0) pending.splice(i, 1);
  }
  function trySend(p) {
    if (p.inflight) return;
    var ok = false;
    if (!p.tries) {
      try { ok = navigator.sendBeacon(BASE + '/ingest/heat', bodyOf(p, false)); } catch (e) { ok = false; }
      if (ok) return;
    }
    if (pending.indexOf(p) < 0) {
      if (pending.length >= MAX_PENDING) return;
      pending.push(p);
    }
    p.tries += 1;
    p.inflight = true;
    // 届いたかを確かめられる送り方(応答が 2xx でなければ持っておいて次に送り直す)
    // 失敗したら間を空ける(固定間隔で叩き続けると、受け口が止まっている間ずっと要求とログの料金がかかる)
    function later() {
      p.inflight = false;
      if (p.tries >= MAX_TRIES) { done(p); return; }
      // 1回目の失敗は次の定期送信でもう一度(一時的な切れ目)。2回目からは間を空ける
      if (p.tries <= 1) { p.next = 0; return; }
      var wait = Math.min(BACKOFF_MS * Math.pow(2, p.tries - 2), BACKOFF_MAX_MS);
      p.next = Date.now() + wait * (0.5 + Math.random() / 2);
    }
    try {
      fetch(BASE + '/ingest/heat', { method: 'POST', body: bodyOf(p, true), keepalive: true, mode: 'cors', credentials: 'omit' })
        .then(function (r) {
          // 2xx=届いた。408/429 以外の 4xx(拒否・形の誤り)は送り直しても通らないので捨てる
          if (r && (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429))) { p.inflight = false; done(p); return; }
          later();
        })
        .catch(later);
    } catch (e) { later(); }
  }
  // 送信の入口はここ1つ。届いていない固まりがある間は、新しい分を固まりにせず手元(qs)で足し続ける。
  // 先の固まりから順に届くようにし、固まりの数も増やさない(長い圏外でも溜まり続けない)。
  // 訪問・CTA・表示幅の切り替えも同じ入口を通る。ページを離れるとき(final)だけは全部出す
  function sendQueued(final) {
    var now = Date.now();
    pending = pending.filter(function (p) { return now - p.made < RETRY_DAYS_MS; });
    var waiting = pending.length > 0;
    // 送信中と、間を空けている最中のものは飛ばす(ページを離れるときだけは間を待たずに一度出す)
    pending.slice().forEach(function (p) { if (final || !p.next || p.next <= now) trySend(p); });
    if (waiting && !final) return;
    var all = qs;
    qs = {};
    Object.keys(all).forEach(function (w) {
      var evs = Object.keys(all[w]).map(function (k) { return all[w][k]; });
      if (evs.length) packets(evs, w).forEach(trySend);
    });
  }

  // 訪問は表示されたときに即時に1発(離脱前に必ず数える)。CTA率の分母はdata-rondo-cta設定済みページだけ別計上し、
  // 旧クライアントの「全操作÷訪問」と混ぜない。端末区分を跨ぐレイアウト変更は、
  // 新しい表示区分の露出として各区分1回だけ開始する。
  var viewSent = {};
  var ctaViewSent = {};
  var ctaSent = {};
  var activeSent = {};
  var secFirst = {};
  function ctaViewEvent(events) {
    if (ctaViewSent[W]) return;
    ctaViewSent[W] = 1;
    events.push({ kind: 'cta_view', sec: '', sel: '', gx: -1, gy: -1, n: 1, v: 0 });
  }
  function beginWidthCohort() {
    if (viewSent[W]) return;
    viewSent[W] = 1;
    var events = [{ kind: 'view', sec: '', sel: '', gx: -1, gy: -1, n: 1, v: 0 }];
    if (document.querySelector('[data-rondo-cta]')) ctaViewEvent(events);
    addAll(events);
    sendQueued(false);
  }

  // ---- 操作の有無(滞在の打ち切り) ----
  var lastAct = Date.now();
  var idle = false;
  function visible() { return document.visibilityState !== 'hidden'; }
  // 時計を閉じるときの終わり。最後の操作から30秒より後は数えない(どの経路で閉じても同じ)
  function capEnd(now) { return Math.min(now, lastAct + IDLE_MS); }
  function goIdleIfDue(now) {
    if (!idle && now - lastAct > IDLE_MS) {
      idle = true;
      closeSegments(lastAct + IDLE_MS);
    }
  }
  function onAct() {
    if (!started) return;
    var now = Date.now();
    goIdleIfDue(now); // 期限を過ぎていたら、前の分を先に締める
    lastAct = now;
    if (idle && visible()) {
      idle = false;
      openSegments(now);
    }
  }
  ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, onAct, { passive: true, capture: true });
  });

  // ---- ページの滞在(見ていた時間) ----
  var activeFrom = 0;
  var activeMs = 0;        // まだ送っていない分
  var activeTotal = {};    // 区分ごとの、この訪問で数えた合計(送っても戻さない＝30分の上限は訪問全体に効く)
  function closeActive(end) {
    if (!activeFrom) return;
    var used = activeTotal[W] || 0;
    var ms = Math.min(end - activeFrom, ACTIVE_CAP_MS - used);
    if (ms > 0) { activeMs += ms; activeTotal[W] = used + ms; }
    activeFrom = 0;
  }
  function emitActive() {
    if (!started) return;
    if (activeMs > 0 || !activeSent[W]) {
      // 訪問(区分)の最初の送信だけ n=1。平均滞在の分母になる
      add('active', '', '', -1, -1, activeSent[W] ? 0 : 1, activeMs);
      activeSent[W] = 1;
      activeMs = 0;
    }
  }

  // ---- 区画の到達と滞在 ----
  var enterT = {};
  var visibleSecs = {};
  var seen = {};
  var secSpent = {};
  function markReach(name) {
    var key = W + '\t' + name;
    if (seen[key]) return;
    seen[key] = 1;
    add('reach', name, '', secIdx[name], -1, 1, 0);
  }
  function closeSec(name, end) {
    var t = enterT[name];
    delete enterT[name];
    if (!t || end <= t) return;
    var key = W + '\t' + name;
    var used = secSpent[key] || 0;
    var ms = Math.min(end - t, SEC_CAP_MS - used);
    if (ms <= 0) return;
    secSpent[key] = used + ms;
    // 区画の滞在は sdwell(この版の数え方)。その区画で最初の分だけ n=1＝見た人の数
    add('sdwell', name, '', secIdx[name], -1, secFirst[key] ? 0 : 1, ms);
    secFirst[key] = 1;
  }
  function closeSegments(end) {
    Object.keys(enterT).forEach(function (name) { closeSec(name, end); });
    closeActive(end);
  }
  function openSegments(now) {
    if (!started || idle || !visible()) return;
    Object.keys(visibleSecs).forEach(function (name) {
      markReach(name);
      if (!enterT[name]) enterT[name] = now;
    });
    if (!activeFrom) activeFrom = now;
  }

  var io = null;
  var ioH = 0;
  function makeObserver() {
    if (!('IntersectionObserver' in window)) return;
    if (io) io.disconnect();
    visibleSecs = {};
    // 上2割より下に入ったら到達。割合指定は実装差があるので画面の高さから px で渡す
    ioH = window.innerHeight || 0;
    var top = Math.round(ioH * 0.2);
    io = new IntersectionObserver(function (es) {
      var now = Date.now();
      es.forEach(function (en) {
        var name = en.target.getAttribute('data-sec');
        if (en.isIntersecting) {
          visibleSecs[name] = 1;
          if (started && !idle && visible()) {
            markReach(name);
            if (!enterT[name]) enterT[name] = now;
          }
        } else {
          delete visibleSecs[name];
          if (enterT[name]) closeSec(name, capEnd(now));
        }
      });
    // 下端は縮めない。短いfooterも最終スクロール位置で到達判定できるようにする。
    }, { threshold: 0, rootMargin: '-' + top + 'px 0px 0px 0px' });
    secEls.forEach(function (el) { io.observe(el); });
  }
  // 区画の顔ぶれ・画面の高さが変わったら、いまの時間を締めて見張り直す(訪問は増やさない)
  function rebuild() {
    var now = Date.now();
    closeSegments(capEnd(now));
    makeObserver();
    if (started && !idle && visible() && !activeFrom) activeFrom = now;
  }

  // ---- クリック(要素台帳+セクション内グリッド)・レイジ・デッド ----
  var recent = [];
  var rageEl = null, rageLast = 0;
  function secName(el) {
    if (!el) return '';
    return el.getAttribute('data-sec') || el.getAttribute('data-rondo-click-sec') || '';
  }
  function selOf(el, secEl) {
    var tag = el.tagName.toLowerCase();
    var s = tag;
    if (el.id) s = tag + '#' + el.id;
    else if (el.classList.length) s = tag + '.' + el.classList[0];
    // クリック領域そのものが押された要素(FAQ の summary に click-sec など)は '=' を頭に付けて、子孫と区別する
    if (secEl && el === secEl) s = '=' + s;
    else try {
      var list = (secEl || document).querySelectorAll(s);
      if (list.length > 1) {
        var i = [].indexOf.call(list, el);
        if (i >= 0) s += ':' + i;
      }
    } catch (err) {}
    // 表示テキストやaria-labelは利用者入力を含む可能性があるため収集しない。
    // 台帳で人間向けラベルが必要な要素だけ、実装者がdata-rondo-labelへ固定文言を明示する。
    var label = (el.getAttribute('data-rondo-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return s + '|' + label;
  }
  function sendCta(el, secEl) {
    if (!started || !el || !el.hasAttribute('data-rondo-cta') || ctaSent[W]) return;
    ctaSent[W] = 1;
    var sec = secName(secEl);
    var events = [];
    if (!ctaViewSent[W]) ctaViewEvent(events);
    events.push({ kind: 'cta_click', sec: sec, sel: selOf(el, secEl), gx: -1, gy: -1, n: 1, v: 0 });
    // 届いていない固まりがあれば手元で待つ(CTA で移るときは pagehide でまとめて出る)
    addAll(events);
    sendQueued(false);
  }
  document.addEventListener('click', function (e) {
    if (!started) return;
    var t = e.target && e.target.nodeType === 1 ? e.target : null;
    if (!t) return;
    // sticky/fixed領域はdwellを歪めるためdata-secにせず、
    // data-rondo-click-secでクリック座標だけを対応づけられる。
    var secEl = t.closest('[data-sec],[data-rondo-click-sec]');
    var sec = secName(secEl);
    var inter = t.closest('a,button,[role=button],input,select,textarea,summary,[data-rondo-click]');
    var label = t.closest('label');
    // control付きlabelのクリック後はブラウザがinputのclickも発火する。
    // label側を数えずcontrol側だけを記録し、1操作=2クリックになるのを防ぐ。
    if (!inter && label && label.control) return;
    if (!inter) inter = label;
    var gx = -1, gy = -1;
    // キーボード操作や el.click() は座標を持たない(detail=0)。回数だけ数えて点は描かない
    var pointed = !(e.detail === 0 && !e.clientX && !e.clientY);
    if (secEl && pointed) {
      var r = secEl.getBoundingClientRect();
      if (r.width > 4 && r.height > 4) {
        gx = Math.max(0, Math.min(GRID - 1, Math.floor((e.clientX - r.left) / r.width * GRID)));
        gy = Math.max(0, Math.min(GRID - 1, Math.floor((e.clientY - r.top) / r.height * GRID)));
      }
    }
    var now = Date.now();
    recent = recent.filter(function (c) { return now - c.t < 800; });
    var target = inter || t;
    var same = recent.filter(function (c) { return c.el === target; }).length;
    recent.push({ t: now, el: target });
    // 連打は「まとまり」で1件(burst)。3回目で数え、同じ要素を800ms以内に押し続ける間は数え足さない
    var rage = false;
    if (target === rageEl && now - rageLast < 800) rageLast = now;
    else if (same >= 2) { rage = true; rageEl = target; rageLast = now; }
    if (inter) {
      var sel = selOf(inter, secEl);
      add('click', sec, sel, gx, gy, 1, 0);
      sendCta(t.closest('[data-rondo-cta]'), secEl);
      if (rage) add('burst', sec, sel, -1, -1, 1, 0);
    } else {
      add('dead', sec, '', gx, gy, 1, 0);
      if (rage) add('burst', sec, '', -1, -1, 1, 0);
    }
  }, true);
  // Enter送信でもCTA反応を取りこぼさない。click経由ならctaSentで二重計上しない。
  document.addEventListener('submit', function (e) {
    var form = e.target && e.target.nodeType === 1 ? e.target : null;
    if (!form) return;
    var cta = e.submitter
      ? (e.submitter.hasAttribute && e.submitter.hasAttribute('data-rondo-cta') ? e.submitter : null)
      : form.querySelector('[data-rondo-cta]');
    if (!cta) return;
    sendCta(cta, cta.closest('[data-sec],[data-rondo-click-sec]'));
  }, true);

  // ---- 送信 ----
  // ここまでの時間を締めて送る。reopen なら続けて数える(表示中の定期送信)
  function checkpoint(reopen, final) {
    var now = Date.now();
    goIdleIfDue(now);
    var open = Object.keys(enterT);
    var wasActive = !!activeFrom;
    closeSegments(capEnd(now));
    emitActive();
    if (reopen && !idle && visible()) {
      open.forEach(function (name) { if (visibleSecs[name]) enterT[name] = now; });
      if (wasActive) activeFrom = now;
    }
    sendQueued(final);
  }
  function onHidden() {
    if (!started) return;
    checkpoint(false, true);
  }
  function onShown() {
    if (!started) { start(); return; }
    lastAct = Date.now();
    idle = false;
    if (syncWidthCohort()) return;
    openSegments(Date.now());
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') onHidden();
    else onShown();
  });
  document.addEventListener('prerenderingchange', function () { if (visible()) onShown(); });
  window.addEventListener('pagehide', onHidden);
  // bfcache から戻ったときは新しい表示として続きから数える(訪問は増やさない)
  window.addEventListener('pageshow', function (e) { if (e && e.persisted && visible()) onShown(); });

  function syncWidthCohort() {
    if (!visible()) return false;
    var nextW = widthKey();
    if (nextW === W) return false;
    // 旧レイアウトの座標・滞在を旧区分で確定してから、新区分の分母と計測を開始する(溜めは区分ごとに分かれている)。
    checkpoint(false, false);
    W = nextW;
    beginWidthCohort();
    // 新しいレイアウトで見えている区画を測り直す(古い見え方のまま到達を付けない)
    makeObserver();
    if (!idle && !activeFrom) activeFrom = Date.now();
    return true;
  }
  var rsT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rsT);
    rsT = setTimeout(function () {
      if (!started || syncWidthCohort()) return;
      // 同じ区分でも画面の高さが変わったら「上2割」を測り直す(間引いた後の最後の高さで・訪問は増やさない)
      var h = window.innerHeight || 0;
      if (h && h !== ioH) rebuild();
    }, 150);
  });

  // 後から足された区画・名前の変わった区画・CTA も数える(診断の結果・差し替えられた区画)
  if ('MutationObserver' in window) {
    var moT = null;
    var mo = new MutationObserver(function () {
      clearTimeout(moT);
      moT = setTimeout(function () {
        if (!started) return; // 表示前に変わった分は start() が拾う
        if (!ctaViewSent[W] && document.querySelector('[data-rondo-cta]')) {
          var events = [];
          ctaViewEvent(events);
          addAll(events);
          sendQueued(false);
        }
        if (secsChanged()) {
          var now = Date.now();
          closeSegments(capEnd(now)); // 古い名前のまま締める
          scanSecs();
          makeObserver();
          if (!idle && visible() && !activeFrom) activeFrom = now;
        }
      }, 120);
    });
    mo.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['data-rondo-cta', 'data-sec'],
    });
  }

  setInterval(function () {
    if (!started || !visible()) return;
    goIdleIfDue(Date.now());
  }, TICK_MS);
  setInterval(function () {
    if (!started || !visible()) return;
    checkpoint(true);
  }, SEND_EVERY_MS);

  function start() {
    if (started || !visible() || document.prerendering || SAMPLED_OUT || window.__rondoHeatOff) return;
    started = true;
    T0 = Date.now();
    lastAct = T0;
    W = widthKey();
    scanSecs();
    beginWidthCohort();
    activeFrom = T0;
    makeObserver();
  }
  start();

  // ================= 閲覧モード(ヒートマップ・オーバーレイ) =================
  function viewer(token) {
    var mode = ((location.hash || '').match(/hm=(click|dead|scroll|dwell)/) || [])[1] || 'click';
    var vw = widthKey();
    var data = null;
    var canvas = null, ctx = null, labels = [];
    var closed = false;
    var drawTimers = [];
    // iOS Safari の canvas の面積の上限(約1,677万px)を超えると何も描かれないので、超える分は解像度を落とす
    var MAX_AREA = 16000000;

    function fetchData() {
      var requestedW = vw;
      fetch(BASE + '/api/heat-data?page=' + PAGE + '&w=' + requestedW + '&days=30&token=' + token)
        .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); return r.json(); })
        .then(function (d) {
          if (closed || requestedW !== vw) return;
          data = d;
          draw();
        })
        .catch(function () {
          if (closed || requestedW !== vw) return;
          note('データを取得できませんでした。閲覧リンクの期限切れの可能性があります。');
        });
    }

    function ensureCanvas() {
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:2147483000;';
        canvas.__rondoHeat = 1;
        document.body.appendChild(canvas);
      }
      // 自分の高さで文書の高さを測り違えないよう、いったん縮めてから測る
      canvas.style.height = '0px';
      canvas.height = 0;
      var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      var docW = document.documentElement.clientWidth;
      var s = Math.min(1, Math.sqrt(MAX_AREA / Math.max(1, docW * docH)));
      canvas.width = Math.floor(docW * s);
      canvas.height = Math.floor(docH * s);
      canvas.style.width = docW + 'px';
      canvas.style.height = docH + 'px';
      ctx = canvas.getContext('2d');
      ctx.setTransform(s, 0, 0, s, 0, 0);
      return { w: docW, h: docH };
    }

    function clearLabels() {
      labels.forEach(function (el) { el.remove(); });
      labels = [];
    }
    function chip(text, x, y) {
      var el = document.createElement('div');
      el.textContent = text;
      el.__rondoHeat = 1;
      el.style.cssText = 'position:absolute;z-index:2147483001;left:' + x + 'px;top:' + y +
        'px;background:rgba(23,24,28,.85);color:#fff;font:600 12px/1.6 sans-serif;padding:2px 10px;border-radius:999px;pointer-events:none;';
      document.body.appendChild(el);
      labels.push(el);
    }
    function secEl(name) {
      var secs = document.querySelectorAll('[data-sec],[data-rondo-click-sec]');
      for (var i = 0; i < secs.length; i += 1) {
        if (secName(secs[i]) === name) return secs[i];
      }
      return null;
    }
    function absRect(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    }
    function secRectAbs(name) {
      var el = secEl(name);
      return el ? absRect(el) : null;
    }
    // 要素台帳の 'tag#id' / 'tag.class:3|ラベル' を、いまのページの要素へ戻す
    function findEl(sec, sel) {
      var css = String(sel || '');
      var bar = css.indexOf('|');
      if (bar >= 0) css = css.slice(0, bar);
      var m = css.match(/^(.*?)(?::([0-9]+))?$/);
      if (!m || !m[1]) return null;
      var root = sec ? secEl(sec) : document;
      if (!root) return null;
      var label = bar >= 0 ? String(sel).slice(bar + 1) : '';
      try {
        var el = null;
        if (m[1].charAt(0) === '=') {
          // 記録したときクリック領域そのものだった('=' 付き)。領域自身が同じ形なら領域、でなければ描かない
          var self = m[1].slice(1);
          el = root !== document && root.matches && root.matches(self) ? root : null;
        } else {
          // 子孫だけを探す(親の領域が同じ形でも親には付けない)
          var list = root.querySelectorAll(m[1]);
          el = list[m[2] ? Number(m[2]) : 0] || null;
        }
        // 同じ形の要素が使い回される所(診断の設問ごとの選択肢など)で別の要素に回数を付けない。ラベルが違えば描かない
        if (el && label && (el.getAttribute('data-rondo-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24) !== label) return null;
        return el;
      } catch (e) { return null; }
    }

    function draw() {
      if (closed || !data) return;
      ensureCanvas();
      ctx.clearRect(0, 0, canvas.width * 4, canvas.height * 4);
      clearLabels();
      if (mode === 'click') { drawPoints(data.clickGrid || data.grid || [], false); drawElements(); }
      else if (mode === 'dead') drawPoints(data.deadGrid || [], true);
      else drawBands(mode === 'scroll');
      bar();
    }

    function drawPoints(grid, isDead) {
      if (!grid.length) {
        if (isDead || !(data.elements || []).length) note(isDead ? '空クリックデータはまだありません。' : '操作クリックデータはまだありません。');
        return;
      }
      var max = 1;
      grid.forEach(function (g) { if (g.n > max) max = g.n; });
      ctx.globalCompositeOperation = 'lighter';
      var mapped = 0, missing = {};
      grid.forEach(function (g) {
        var r = secRectAbs(g.sec);
        if (!r) { missing[g.sec] = 1; return; }
        if (r.w < 2 || r.h < 2) return; // いまは隠れている領域(PC で見た下の固定ボタンなど)
        mapped += 1;
        var x = r.x + (g.gx + 0.5) / GRID * r.w;
        var y = r.y + (g.gy + 0.5) / GRID * r.h;
        var rad = Math.max(18, Math.min(46, r.w / GRID));
        var a = 0.25 + 0.6 * (g.n / max);
        var grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        if (isDead) {
          grad.addColorStop(0, 'rgba(80,92,255,' + a.toFixed(3) + ')');
          grad.addColorStop(0.55, 'rgba(90,190,255,' + (a * 0.5).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(120,220,255,0)');
        } else {
          grad.addColorStop(0, 'rgba(255,80,40,' + a.toFixed(3) + ')');
          grad.addColorStop(0.55, 'rgba(255,170,40,' + (a * 0.5).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(255,220,60,0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      if (!mapped) note('ページ側のdata-secと計測データが一致しないため、位置を描画できません。');
      else if (Object.keys(missing).length) note('いまのページに無い区画のデータは描いていません（' + Object.keys(missing).slice(0, 3).join('・') + '）。');
    }

    // 押された要素そのものに枠と回数を付ける(区画の高さが変わってもずれない)
    function drawElements() {
      var els = (data.elements || []).slice(0, 15);
      els.forEach(function (e2, i) {
        var el = findEl(e2.sec, e2.sel);
        if (!el) return;
        var r = absRect(el);
        if (r.w < 2 || r.h < 2) return;
        ctx.strokeStyle = 'rgba(255,90,40,.95)';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
        chip((i + 1) + '位 ' + e2.clicks + '回', r.x + r.w - 8, Math.max(0, r.y - 12));
      });
    }

    function drawBands(isScroll) {
      var secs = data.sections || [];
      if (!secs.length) { note('セクションデータはまだありません。'); return; }
      var maxDwell = 1;
      secs.forEach(function (s) { if (s.dwellAvgMs > maxDwell) maxDwell = s.dwellAvgMs; });
      secs.forEach(function (s) {
        var r = secRectAbs(s.sec);
        if (!r) return;
        var rate = s.reachRate == null ? 0 : Math.min(1, s.reachRate);
        var none = !isScroll && s.dwellAvgMs == null; // 新しい計測の滞在がまだ無い(0秒とは違う)
        var v = isScroll ? rate : (s.dwellAvgMs || 0) / maxDwell;
        var hue = Math.round(v * 120);
        if (!none) {
          ctx.fillStyle = 'hsla(' + (isScroll ? hue : 20) + ',85%,50%,' + (isScroll ? 0.22 : (0.05 + v * 0.3)).toFixed(3) + ')';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        ctx.fillStyle = 'rgba(23,24,28,.25)';
        ctx.fillRect(r.x, r.y, r.w, 1);
        var text = isScroll
          ? s.sec + ' 到達 ' + (s.reachRate == null ? '—' : Math.round(s.reachRate * 100) + '%')
          : none ? s.sec + ' 見た人の平均 —（新しい計測を待っています）'
            : s.sec + ' 見た人の平均 ' + Math.round(s.dwellAvgMs / 1000) + '秒' + (data.legacy && data.legacy.dwell ? '（10/9より前の数え方）' : '');
        chip(text, r.x + 12, r.y + 10);
      });
    }

    var barEl = null, noteEl = null;
    function note(text) {
      if (closed) return;
      if (!noteEl) {
        noteEl = document.createElement('div');
        noteEl.__rondoHeat = 1;
        noteEl.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483002;' +
          'background:rgba(23,24,28,.9);color:#fff;font:500 13px/1.7 sans-serif;padding:8px 18px;border-radius:10px;';
        document.body.appendChild(noteEl);
      }
      noteEl.textContent = text;
      clearTimeout(noteEl._t);
      noteEl._t = setTimeout(function () { if (noteEl) { noteEl.remove(); noteEl = null; } }, 4000);
    }
    function bar() {
      if (closed || barEl) return;
      barEl = document.createElement('div');
      barEl.__rondoHeat = 1;
      barEl.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:2147483002;' +
        'display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center;width:max-content;' +
        'max-width:calc(100vw - 16px);box-sizing:border-box;background:rgba(23,24,28,.92);color:#fff;padding:8px 10px;' +
        'border-radius:12px;font:500 13px/1.6 sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.35);';
      var mk = function (label, on, fn) {
        var b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = 'border:none;cursor:pointer;border-radius:8px;padding:5px 12px;white-space:nowrap;font:600 12.5px sans-serif;' +
          (on ? 'background:#fff;color:#17181C;' : 'background:transparent;color:#C6C9D2;');
        b.addEventListener('click', fn);
        barEl.appendChild(b);
        return b;
      };
      mk('操作クリック', mode === 'click', function () { mode = 'click'; rebar(); });
      mk('空クリック', mode === 'dead', function () { mode = 'dead'; rebar(); });
      mk('スクロール到達', mode === 'scroll', function () { mode = 'scroll'; rebar(); });
      mk('アテンション', mode === 'dwell', function () { mode = 'dwell'; rebar(); });
      var sep = document.createElement('span');
      sep.style.cssText = 'width:1px;height:18px;background:rgba(255,255,255,.25);margin:0 4px;';
      barEl.appendChild(sep);
      var badge = document.createElement('span');
      badge.textContent = (vw === 'sp' ? 'SP' : 'PC') + 'データ（表示幅に連動）';
      badge.style.cssText = 'padding:5px 8px;color:#C6C9D2;font:600 11.5px sans-serif;white-space:nowrap;';
      barEl.appendChild(badge);
      mk('閉じる', false, closeViewer);
      document.body.appendChild(barEl);
    }
    function rebar() {
      if (barEl) { barEl.remove(); barEl = null; }
      draw();
    }

    function clearSurface() {
      clearLabels();
      if (canvas) { canvas.remove(); canvas = null; ctx = null; }
    }
    function closeViewer() {
      if (closed) return;
      closed = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('toggle', later, true);
      document.removeEventListener('load', later, true);
      if (ro) ro.disconnect();
      if (vmo) vmo.disconnect();
      clearTimeout(rs);
      clearTimeout(scrollRs);
      clearTimeout(laterT);
      drawTimers.forEach(function (id) { clearTimeout(id); });
      drawTimers = [];
      if (barEl) { barEl.remove(); barEl = null; }
      if (noteEl) {
        clearTimeout(noteEl._t);
        noteEl.remove();
        noteEl = null;
      }
      clearSurface();
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    }

    var rs = null;
    function onResize() {
      clearTimeout(rs);
      rs = setTimeout(function () {
        if (closed) return;
        var nextW = widthKey();
        if (nextW !== vw) {
          vw = nextW;
          data = null;
          clearSurface();
          if (barEl) { barEl.remove(); barEl = null; }
          bar();
          fetchData();
        } else {
          draw();
        }
      }, 200);
    }
    window.addEventListener('resize', onResize);

    // ページの高さが変わったら描き直す(埋め込み・遅延読込の画像・FAQ の開閉・タブの切り替え)
    var laterT = null;
    function later() {
      clearTimeout(laterT);
      laterT = setTimeout(function () { if (!closed) draw(); }, 150);
    }
    var ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(later);
      ro.observe(document.body);
    }
    document.addEventListener('toggle', later, true);
    document.addEventListener('load', later, true);
    // 中身の差し替え(診断の設問の切り替えなど)・ラベルの付け替えでも描き直す。自分が描いた枠・札・操作バーの出し入れは無視する
    function ours(n) {
      for (var p = n; p && p !== document.body; p = p.parentNode) { if (p.__rondoHeat) return true; }
      return false;
    }
    var vmo = null;
    if ('MutationObserver' in window) {
      vmo = new MutationObserver(function (recs) {
        for (var i = 0; i < recs.length; i += 1) {
          var r = recs[i];
          if (r.type === 'attributes') { if (!ours(r.target)) { later(); return; } continue; }
          var nodes = [].slice.call(r.addedNodes || []).concat([].slice.call(r.removedNodes || []));
          if (ours(r.target) || (nodes.length && nodes.every(function (n) { return n.__rondoHeat; }))) continue;
          later();
          return;
        }
      });
      vmo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-rondo-label', 'data-sec', 'data-rondo-click-sec', 'class', 'hidden'] });
    }

    // 画面に貼り付いた(sticky/fixed)クリック専用領域があるときだけ、スクロール後の位置へ追従させる
    function pinned(el) {
      for (var p = el; p && p.nodeType === 1; p = p.parentElement) {
        var pos = window.getComputedStyle(p).position;
        if (pos === 'fixed' || pos === 'sticky') return true;
      }
      return false;
    }
    var watchSticky = [].some.call(document.querySelectorAll('[data-rondo-click-sec]'), pinned);
    var scrollRs = null;
    function onScroll() {
      clearTimeout(scrollRs);
      scrollRs = setTimeout(function () { if (!closed) draw(); }, 80);
    }
    if (watchSticky) window.addEventListener('scroll', onScroll, { passive: true });

    // 念のための描き直し(ResizeObserver の無い古い環境向け)
    drawTimers.push(setTimeout(draw, 1500));
    drawTimers.push(setTimeout(draw, 4000));
    bar();
    fetchData();
  }
})();
