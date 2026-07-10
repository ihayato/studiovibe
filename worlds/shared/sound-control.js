import { createSound } from '../../poc/island/sound.js';

export function setupWorldSound({ soundtrack, volume = 0.3, showToast = () => {} } = {}) {
  const soundButton = document.getElementById('sound');
  if (!soundtrack) {
    if (soundButton) soundButton.hidden = true;
    return null;
  }

  const sound = createSound({
    tracks: { world: soundtrack },
    initialZone: 'world',
    bgmLevel: volume,
  });
  if (!soundButton) return sound;

  const render = () => {
    const playing = sound.on;
    soundButton.classList.toggle('is-off', !playing);
    soundButton.setAttribute('aria-pressed', String(playing));
    soundButton.setAttribute('aria-label', playing ? 'BGMを停止' : 'BGMを再生');
    soundButton.title = playing ? 'BGMを停止' : 'BGMを再生';
  };
  render();

  soundButton.addEventListener('pointerdown', (event) => event.stopPropagation());
  soundButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    try {
      await sound.toggle();
      sound.se.ui();
      showToast(sound.on ? 'BGMを再生しました' : 'BGMを停止しました', 1400);
    } catch {
      showToast('この端末ではBGMを再生できません', 2200);
    }
    render();
  });

  let resumeAttempted = false;
  const resumeSavedSound = (event) => {
    const fromSoundButton = event.composedPath?.().includes(soundButton)
      || event.target === soundButton
      || (event.target instanceof Node && soundButton.contains(event.target));
    if (resumeAttempted || fromSoundButton) return;
    resumeAttempted = true;
    removeEventListener('pointerdown', resumeSavedSound, true);
    removeEventListener('keydown', resumeSavedSound, true);
    sound.resumeIfSaved().finally(render);
  };
  addEventListener('pointerdown', resumeSavedSound, true);
  addEventListener('keydown', resumeSavedSound, true);

  return sound;
}
