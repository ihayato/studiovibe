const pageKey = document.documentElement.dataset.guide || 'guide';
const storageKey = `rondo-guide-progress:${pageKey}`;
const checks = [...document.querySelectorAll('.task-check')];
const progressMeter = document.querySelector('.progress-track[role="progressbar"]');
const progressBar = document.querySelector('.progress-bar');
const progressValue = document.querySelector('.progress-value');
const progressNote = document.querySelector('.progress-note');
const liveRegion = document.querySelector('#guide-status');

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    return {};
  }
}

function writeProgress(value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // file://や厳格なプライバシー設定では、画面内だけの進捗として動作する。
  }
}

function updateProgress(announce = false) {
  const done = checks.filter((check) => check.checked).length;
  const total = checks.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
  if (progressMeter) progressMeter.setAttribute('aria-valuenow', String(percent));
  if (progressValue) progressValue.textContent = `${done} / ${total}`;
  if (progressNote) {
    progressNote.textContent = percent === 100
      ? 'すべて完了しました。次のガイドへ進めます。'
      : 'チェック状態はこのブラウザに保存されます。';
  }
  if (announce && liveRegion) {
    liveRegion.textContent = percent === 100
      ? 'ガイドの全項目が完了しました。'
      : `進捗を更新しました。${total}項目中${done}項目が完了しています。`;
  }
}

const saved = readProgress();
for (const check of checks) {
  check.checked = saved[check.id] === true;
  check.addEventListener('change', () => {
    const next = readProgress();
    next[check.id] = check.checked;
    writeProgress(next);
    updateProgress(true);
  });
}
updateProgress();

for (const button of document.querySelectorAll('.copy-button')) {
  button.addEventListener('click', async () => {
    const copyText = button.closest('.copy-block')?.querySelector('code')?.textContent?.trim() || '';
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      button.textContent = '完了';
      if (liveRegion) liveRegion.textContent = 'AIへの依頼文をコピーしました。';
      window.setTimeout(() => {
        button.textContent = 'コピー';
      }, 1600);
    } catch {
      if (liveRegion) {
        liveRegion.textContent = '自動コピーできませんでした。依頼文を選択してコピーしてください。';
      }
    }
  });
}

const sections = [...document.querySelectorAll('.step[id]')];
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
if ('IntersectionObserver' in window && sections.length && tocLinks.length) {
  const linkById = new Map(tocLinks.map((link) => [link.getAttribute('href').slice(1), link]));
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    for (const link of tocLinks) link.removeAttribute('aria-current');
    linkById.get(visible.target.id)?.setAttribute('aria-current', 'location');
  }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.1] });
  for (const section of sections) observer.observe(section);
}
