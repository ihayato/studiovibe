// Rondo の計測スクリプト(heat-client.mjs)の写し。デモでは閲覧モードだけを使う(見本のLPがデータの取得を中で返す)
(function () {
  'use strict';
  var sc = document.currentScript;
  if (!sc) return;
  var PAGE = sc.getAttribute('data-page') || '';
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(PAGE)) return;
  var BASE = '';
  try { BASE = new URL(sc.src).origin; } catch (e) { return; }
  var GRID = 20;
  function widthKey() { return window.innerWidth < 768 ? 'sp' : 'pc'; }
  var W = widthKey();

  var tokenMatch = (location.hash || '').match(/rondoheat=([a-z0-9.-]+)/);
  if (tokenMatch) { viewer(tokenMatch[1]); return; }

  // ================= 計測モード =================
  var secEls = [].slice.call(document.querySelectorAll('[data-sec]'));
  var secIdx = {};
  secEls.forEach(function (el, i) { secIdx[el.getAttribute('data-sec')] = i; });

  var q = {};
  function add(kind, sec, sel, gx, gy, n, v) {
    var key = kind + '\t' + sec + '\t' + sel + '\t' + gx + '\t' + gy;
    var cur = q[key];
    if (cur) { cur.n += n; cur.v += v; }
    else q[key] = { kind: kind, sec: sec, sel: sel, gx: gx, gy: gy, n: n, v: v };
  }
  // 受け口は1リクエスト80行までしか書かない。長い訪問の離脱時flushでも切り捨てられないよう60件ずつ送る
  function send(events) {
    for (var i = 0; i < events.length; i += 60) {
      var body = JSON.stringify({ page: PAGE, url: location.origin + location.pathname, w: W, events: events.slice(i, i + 60) });
      try { navigator.sendBeacon(BASE + '/ingest/heat', body); } catch (e) {}
    }
  }

  // 訪問は即時に1発(離脱前に必ず数える)。CTA率の分母はdata-rondo-cta設定済みページだけ別計上し、
  // 旧クライアントの「全操作÷訪問」と混ぜない。端末区分を跨ぐレイアウト変更は、
  // 新しい表示区分の露出として各区分1回だけ開始する。
  var viewSent = {};
  var ctaViewSent = {};
  var ctaSent = {};
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
    send(events);
  }
  beginWidthCohort();

  // 診断結果など、後からDOMへ追加されるCTAも「押した人だけ」を分母にしない。
  // 属性追加直後のクリックがMutationObserverより先でもsendCta側で同じイベントを補完する。
  if ('MutationObserver' in window) {
    var ctaObserver = new MutationObserver(function () {
      if (ctaViewSent[W] || !document.querySelector('[data-rondo-cta]')) return;
      var events = [];
      ctaViewEvent(events);
      send(events);
    });
    ctaObserver.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['data-rondo-cta'],
    });
  }

  // スクロール到達+滞在
  var enterT = {};
  var visibleSecs = {};
  var seen = {};
  function markReach(name) {
    var key = W + '\t' + name;
    if (seen[key]) return;
    seen[key] = 1;
    add('reach', name, '', secIdx[name], -1, 1, 0);
  }
  if ('IntersectionObserver' in window && secEls.length) {
    var io = new IntersectionObserver(function (es) {
      var now = Date.now();
      es.forEach(function (en) {
        var name = en.target.getAttribute('data-sec');
        if (en.isIntersecting) {
          visibleSecs[name] = 1;
          if (document.visibilityState !== 'hidden') {
            if (!enterT[name]) enterT[name] = now;
            markReach(name);
          }
        } else {
          delete visibleSecs[name];
          if (enterT[name]) {
            add('dwell', name, '', secIdx[name], -1, 1, Math.min(now - enterT[name], 900000));
            delete enterT[name];
          }
        }
      });
    // 下端は縮めない。短いfooterも最終スクロール位置で到達判定できるようにする。
    }, { threshold: 0, rootMargin: '-20% 0px 0px 0px' });
    secEls.forEach(function (el) { io.observe(el); });
  }

  // クリック(要素台帳+セクション内グリッド)・レイジ・デッド
  var recent = [];
  function secName(el) {
    if (!el) return '';
    return el.getAttribute('data-sec') || el.getAttribute('data-rondo-click-sec') || '';
  }
  function selOf(el, secEl) {
    var tag = el.tagName.toLowerCase();
    var s = tag;
    if (el.id) s = tag + '#' + el.id;
    else if (el.classList.length) s = tag + '.' + el.classList[0];
    try {
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
    if (!el || !el.hasAttribute('data-rondo-cta') || ctaSent[W]) return;
    ctaSent[W] = 1;
    var sec = secName(secEl);
    var events = [];
    if (!ctaViewSent[W]) ctaViewEvent(events);
    events.push({ kind: 'cta_click', sec: sec, sel: selOf(el, secEl), gx: -1, gy: -1, n: 1, v: 0 });
    send(events);
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.nodeType === 1 ? e.target : null;
    if (!t) return;
    // sticky/fixed領域はdwellを歪めるためdata-secにせず、
    // data-rondo-click-secでクリック座標だけを対応づけられる。
    var secEl = t.closest('[data-sec],[data-rondo-click-sec]');
    var sec = secName(secEl);
    var inter = t.closest('a,button,[role=button],input,select,textarea,summary');
    var label = t.closest('label');
    // control付きlabelのクリック後はブラウザがinputのclickも発火する。
    // label側を数えずcontrol側だけを記録し、1操作=2クリックになるのを防ぐ。
    if (!inter && label && label.control) return;
    if (!inter) inter = label;
    var gx = -1, gy = -1;
    if (secEl) {
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
    if (inter) {
      var sel = selOf(inter, secEl);
      add('click', sec, sel, gx, gy, 1, 0);
      sendCta(t.closest('[data-rondo-cta]'), secEl);
      if (same >= 2) add('rage', sec, sel, -1, -1, 1, 0);
    } else {
      add('dead', sec, '', gx, gy, 1, 0);
      if (same >= 2) add('rage', sec, '', -1, -1, 1, 0);
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

  function flush() {
    var now = Date.now();
    Object.keys(enterT).forEach(function (name) {
      add('dwell', name, '', secIdx[name], -1, 1, Math.min(now - enterT[name], 900000));
    });
    enterT = {};
    var evs = Object.keys(q).map(function (k) { return q[k]; });
    q = {};
    send(evs);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
    else {
      syncWidthCohort();
      resumeVisibleSecs();
    }
  });
  window.addEventListener('pagehide', flush);
  function syncWidthCohort() {
    if (document.visibilityState === 'hidden') return false;
    var nextW = widthKey();
    if (nextW === W) return false;
    // 旧レイアウトの座標・滞在を旧区分で確定してから、新区分の分母と計測を開始する。
    flush();
    W = nextW;
    beginWidthCohort();
    return true;
  }
  function resumeVisibleSecs() {
    var now = Date.now();
    Object.keys(visibleSecs).forEach(function (name) {
      markReach(name);
      enterT[name] = now;
    });
  }
  window.addEventListener('resize', function () {
    if (syncWidthCohort()) resumeVisibleSecs();
  });

  // ================= 閲覧モード(ヒートマップ・オーバーレイ) =================
  function viewer(token) {
    var mode = ((location.hash || '').match(/hm=(click|dead|scroll|dwell)/) || [])[1] || 'click';
    var vw = widthKey();
    var data = null;
    var canvas = null, ctx = null, labels = [];
    var closed = false;
    var drawTimers = [];

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
        document.body.appendChild(canvas);
      }
      var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      canvas.width = document.documentElement.clientWidth;
      canvas.height = docH;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = docH + 'px';
      ctx = canvas.getContext('2d');
    }

    function clearLabels() {
      labels.forEach(function (el) { el.remove(); });
      labels = [];
    }
    function chip(text, x, y) {
      var el = document.createElement('div');
      el.textContent = text;
      el.style.cssText = 'position:absolute;z-index:2147483001;left:' + x + 'px;top:' + y +
        'px;background:rgba(23,24,28,.85);color:#fff;font:600 12px/1.6 sans-serif;padding:2px 10px;border-radius:999px;pointer-events:none;';
      document.body.appendChild(el);
      labels.push(el);
    }
    function secRectAbs(name) {
      var el = null;
      var secs = document.querySelectorAll('[data-sec],[data-rondo-click-sec]');
      for (var i = 0; i < secs.length; i += 1) {
        if (secName(secs[i]) === name) { el = secs[i]; break; }
      }
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    }

    function draw() {
      if (closed || !data) return;
      ensureCanvas();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      clearLabels();
      if (mode === 'click') drawPoints(data.clickGrid || data.grid || [], false);
      else if (mode === 'dead') drawPoints(data.deadGrid || [], true);
      else drawBands(mode === 'scroll');
      bar();
    }

    function drawPoints(grid, isDead) {
      if (!grid.length) {
        note(isDead ? '空クリックデータはまだありません。' : '操作クリックデータはまだありません。');
        return;
      }
      var max = 1;
      grid.forEach(function (g) { if (g.n > max) max = g.n; });
      ctx.globalCompositeOperation = 'lighter';
      var mapped = 0;
      grid.forEach(function (g) {
        var r = secRectAbs(g.sec);
        if (!r) return;
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
    }

    function drawBands(isScroll) {
      var secs = data.sections || [];
      if (!secs.length) { note('セクションデータはまだありません。'); return; }
      var maxDwell = 1;
      secs.forEach(function (s) { if (s.dwellAvgMs > maxDwell) maxDwell = s.dwellAvgMs; });
      secs.forEach(function (s) {
        var r = secRectAbs(s.sec);
        if (!r) return;
        var v = isScroll ? (s.reachRate == null ? 0 : s.reachRate) : (s.dwellAvgMs || 0) / maxDwell;
        var hue = Math.round(v * 120);
        ctx.fillStyle = 'hsla(' + (isScroll ? hue : 20) + ',85%,50%,' + (isScroll ? 0.22 : (0.05 + v * 0.3)).toFixed(3) + ')';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = 'rgba(23,24,28,.25)';
        ctx.fillRect(r.x, r.y, r.w, 1);
        var text = isScroll
          ? s.sec + ' 到達 ' + (s.reachRate == null ? '—' : Math.round(s.reachRate * 100) + '%')
          : s.sec + ' 平均滞在 ' + Math.round((s.dwellAvgMs || 0) / 1000) + '秒';
        chip(text, r.x + 12, r.y + 10);
      });
    }

    var barEl = null, noteEl = null;
    function note(text) {
      if (closed) return;
      if (!noteEl) {
        noteEl = document.createElement('div');
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
      if (watchSticky) window.removeEventListener('scroll', onScroll);
      clearTimeout(rs);
      clearTimeout(scrollRs);
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

    // stickyなクリック専用領域はスクロール後の位置へ追従させる。
    var watchSticky = !!document.querySelector('[data-rondo-click-sec]');
    var scrollRs = null;
    function onScroll() {
      clearTimeout(scrollRs);
      scrollRs = setTimeout(function () { if (!closed) draw(); }, 80);
    }
    if (watchSticky) window.addEventListener('scroll', onScroll, { passive: true });

    // 遅延読込画像などで文書の高さが変わったら描き直す
    drawTimers.push(setTimeout(draw, 1500));
    drawTimers.push(setTimeout(draw, 4000));
    bar();
    fetchData();
  }
})();
