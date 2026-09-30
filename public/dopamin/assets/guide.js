// 攻略帖: 月蝕の押しどき計算機。式の定数は頁（data-grow / data-step＝ゲームの定数から書き出し）から読む
(function () {
  var box = document.getElementById('calc');
  if (!box) return;
  var grow = parseFloat(box.dataset.grow), step = parseFloat(box.dataset.step);
  var now = document.getElementById('c-now'), x = document.getElementById('c-x'), at = document.getElementById('c-at');
  var res = document.getElementById('c-res'), atO = document.getElementById('c-at-o');
  function fmt(v) {
    if (!isFinite(v)) return '—';
    if (v < 100) return (Math.floor(v * 10) / 10).toFixed(1) + '倍';
    return Math.floor(v).toLocaleString('ja-JP') + '倍';
  }
  function run() {
    var n = parseFloat(now.value), r = parseFloat(x.value), m = parseFloat(at.value);
    atO.textContent = isFinite(m) ? Math.round(m).toLocaleString('ja-JP') : '—';
    if (!(n > 0) || !(r >= 1) || !(m > 0)) { res.textContent = '—'; return; }
    // 蝕片は今いる夜でなく巡りの最深で決まる＝最深より浅い夜で押しても減らない
    res.textContent = fmt(1 + (r - 1) * Math.pow(grow, (Math.max(m, n) - n) / step));
  }
  [now, x, at].forEach(function (el) { el.addEventListener('input', run); });
  run();
})();
