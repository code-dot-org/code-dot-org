import type {JsonVideo} from '../src/index';

/**
 * A control bar for a <json-video> without `controls`, built only on the
 * element's public media interface: what a page would write in place of the
 * built-in bar. Append it inside the element; the element shows its children
 * over the video, so the bar stays visible in fullscreen.
 *
 * The control names match the built-in bar's, so the e2e suite drives both
 * with the same driver.
 */
export function createCustomControls(video: JsonVideo): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'custom-controls';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Video controls');
  bar.innerHTML = `
    <button type="button" data-control="play">Play</button>
    <button type="button" data-control="mute">Mute</button>
    <input type="range" data-control="volume" aria-label="Volume"
      min="0" max="1" step="0.05" value="1">
    <span><span data-testid="current-time">0:00</span> /
      <span data-testid="duration">0:00</span></span>
    <input type="range" data-control="seek" aria-label="Seek"
      min="0" max="100" step="0.1" value="0">
    <button type="button" data-control="captions" aria-pressed="false">Captions</button>
    <button type="button" data-control="fullscreen">Enter full screen</button>
  `;

  const get = <T extends HTMLElement>(selector: string): T =>
    bar.querySelector<T>(selector)!;
  const play = get<HTMLButtonElement>('[data-control="play"]');
  const mute = get<HTMLButtonElement>('[data-control="mute"]');
  const volume = get<HTMLInputElement>('[data-control="volume"]');
  const seek = get<HTMLInputElement>('[data-control="seek"]');
  const captions = get<HTMLButtonElement>('[data-control="captions"]');
  const fullscreen = get<HTMLButtonElement>('[data-control="fullscreen"]');
  const currentTime = get<HTMLElement>('[data-testid="current-time"]');
  const duration = get<HTMLElement>('[data-testid="duration"]');
  const track = video.textTracks[0];

  play.onclick = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  mute.onclick = () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  };
  volume.oninput = () => {
    video.volume = Number(volume.value);
    if (video.volume > 0) video.muted = false;
  };
  seek.oninput = () => {
    if (Number.isFinite(video.duration)) {
      video.currentTime = (Number(seek.value) / 100) * video.duration;
    }
  };
  captions.onclick = () => {
    track.mode = track.mode === 'showing' ? 'disabled' : 'showing';
    // The track list's change event arrives a task later; reflect it now.
    syncCaptions();
  };
  fullscreen.onclick = () => {
    if (document.fullscreenElement === video) document.exitFullscreen();
    else video.requestFullscreen();
  };

  const syncPlay = () => {
    play.textContent = video.paused ? 'Play' : 'Pause';
  };
  const syncVolume = () => {
    mute.textContent = video.muted || video.volume === 0 ? 'Unmute' : 'Mute';
    volume.value = String(video.muted ? 0 : video.volume);
  };
  const syncTime = () => {
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    currentTime.textContent = formatTime(video.currentTime);
    duration.textContent = formatTime(total);
    seek.value = String(total ? (video.currentTime / total) * 100 : 0);
  };
  const syncCaptions = () => {
    captions.setAttribute('aria-pressed', String(track.mode === 'showing'));
  };
  const syncFullscreen = () => {
    fullscreen.textContent =
      document.fullscreenElement === video
        ? 'Exit full screen'
        : 'Enter full screen';
  };

  for (const type of ['play', 'pause', 'ended', 'emptied']) {
    video.addEventListener(type, syncPlay);
  }
  video.addEventListener('volumechange', syncVolume);
  for (const type of ['timeupdate', 'durationchange', 'seeked', 'emptied']) {
    video.addEventListener(type, syncTime);
  }
  video.textTracks.addEventListener('change', syncCaptions);
  document.addEventListener('fullscreenchange', syncFullscreen);

  return bar;
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
