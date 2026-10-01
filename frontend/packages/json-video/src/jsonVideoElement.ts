import styles from './jsonVideoStyles';

/** One scene of a video document. */
export interface JsonVideoScene {
  /** Seconds, as `'12.38s'` or `'12.38'`; `'auto'` or absent derives it from `speech`. */
  duration?: string;
  /** Caption text; also drives the `auto` duration. */
  speech?: string;
  /** Markup rendered in the scene frame. */
  html?: string;
  /** This scene's own clip, a URL or data URI. */
  audio?: string;
  /** Pause the top-level track for this scene. */
  pauseBackground?: boolean;
}

/** The JSON document a `src` resolves to. */
export interface JsonVideoData {
  /** A track that runs under the whole video. */
  audio?: string;
  scenes: JsonVideoScene[];
}

interface ProcessedScene extends JsonVideoScene {
  startTimeMs: number;
  endTimeMs: number;
}

// Simulated MediaError to match native <video> behavior
class SimulatedMediaError {
  code: number;
  message: string;
  // Standard codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
  readonly MEDIA_ERR_ABORTED = 1;
  readonly MEDIA_ERR_NETWORK = 2;
  readonly MEDIA_ERR_DECODE = 3;
  readonly MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}

// Old WebKit fullscreen API, still the only one on iOS Safari.
interface WebkitFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
}
interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => void;
}

export class JsonVideo extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'controls', 'poster'];
  }

  _videoData: JsonVideoData | null;
  _processedScenes: ProcessedScene[];
  _totalDurationMs: number;
  _currentTimeMs: number;
  _isPlaying: boolean;
  _currentSceneIndex: number;
  _lastTimestamp: number;
  _animationFrameId: number | null;
  _showCaptions: boolean;
  _volume: number;
  _lastVolume?: number;
  _currentBlobUrl?: string;
  error: SimulatedMediaError | null;
  _mainAudio: HTMLAudioElement;
  _sceneAudio: HTMLAudioElement;
  _mainAudioPausedByScene: boolean;
  _mainAudioResumeTime: number;
  renderer!: HTMLIFrameElement;
  posterImg!: HTMLImageElement;
  ccOverlay!: HTMLElement;
  ccText!: HTMLElement;
  ui!: {
    playBtn: HTMLButtonElement;
    muteBtn: HTMLButtonElement;
    progress: HTMLInputElement;
    curTime: HTMLElement;
    totTime: HTMLElement;
    volume: HTMLInputElement;
    ccBtn: HTMLButtonElement;
    fullscreenBtn: HTMLButtonElement;
  };
  _onFullscreenChange!: () => void;

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._videoData = null;
    this._processedScenes = [];
    this._totalDurationMs = 0;
    this._currentTimeMs = 0;
    this._isPlaying = false;
    this._currentSceneIndex = -1;
    this._lastTimestamp = 0;
    this._animationFrameId = null;
    this._showCaptions = false;
    this._volume = 1.0;

    // Mimic standard video properties
    this.error = null;

    this._mainAudio = new Audio();
    this._sceneAudio = new Audio();

    this._mainAudio.crossOrigin = 'anonymous';
    this._sceneAudio.crossOrigin = 'anonymous';

    this.shadowRoot!.appendChild(this._mainAudio);
    this.shadowRoot!.appendChild(this._sceneAudio);

    this._mainAudioPausedByScene = false;
    this._mainAudioResumeTime = 0;

    this._setupDOM();
  }

  _setupDOM() {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    const container = document.createElement('div');
    container.id = 'video-container';

    container.innerHTML = `
            <img id="poster" class="hidden" alt="">
            <iframe id="scene-renderer" src="about:blank" scrolling="no" sandbox="allow-scripts"></iframe>
            <div id="closed-caption-overlay" class="hidden"><span class="cc-text"></span></div>
            <div id="controls-bar">
                <div class="controls-row">
                    <button id="play-btn" class="control-btn"></button>
                    <div class="volume-control">
                        <button id="mute-btn" class="control-btn"></button>
                        <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="1">
                    </div>
                    <div class="time-display">
                        <span id="cur-time">0:00</span> / <span id="tot-time">0:00</span>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <button id="cc-btn" class="control-btn"></button>
                    <button id="fullscreen-btn" class="control-btn"></button>
                </div>
                <div id="progress-container">
                    <input type="range" id="progress-bar" min="0" max="100" value="0" step="0.1">
                </div>
            </div>
        `;

    const root = this.shadowRoot!;
    root.appendChild(styleElement);
    root.appendChild(container);

    const q = <T extends Element>(selector: string) =>
      root.querySelector(selector) as T;
    this.renderer = q('#scene-renderer');
    this.posterImg = q('#poster');
    this.ccOverlay = q('#closed-caption-overlay');
    this.ccText = q('.cc-text');

    this.ui = {
      playBtn: q('#play-btn'),
      muteBtn: q('#mute-btn'),
      progress: q('#progress-bar'),
      curTime: q('#cur-time'),
      totTime: q('#tot-time'),
      volume: q('#volume-slider'),
      ccBtn: q('#cc-btn'),
      fullscreenBtn: q('#fullscreen-btn'),
    };

    this._bindEvents();
    this._setupResizeObserver();
  }

  _setupResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target !== this) {
          console.error('unexpected ResizeObserver target:', entry.target);
        } else {
          let timeDisplay = 'none';
          if (entry.contentRect.width > 275) {
            timeDisplay = 'block';
          }
          this.style.setProperty('--time-display', timeDisplay);
        }
      }
    });

    resizeObserver.observe(this);
  }

  _bindEvents() {
    this.ui.playBtn.onclick = () => (this.paused ? this.play() : this.pause());
    this.ui.progress.oninput = () =>
      this.seekTo(
        (parseFloat(this.ui.progress.value) / 100) * this._totalDurationMs,
      );
    this.ui.volume.oninput = () =>
      (this.volume = parseFloat(this.ui.volume.value));

    this.ui.muteBtn.onclick = () => {
      if (this.volume > 0) {
        this._lastVolume = this.volume;
        this.volume = 0;
      } else {
        this.volume = this._lastVolume || 1.0;
      }
    };

    this.ui.ccBtn.onclick = () => {
      this._showCaptions = !this._showCaptions;
      this.ui.ccBtn.classList.toggle('disabled', !this._showCaptions);
      this._renderCurrentScene();
    };

    this.ui.fullscreenBtn.onclick = () => this._toggleFullscreen();

    this._onFullscreenChange = () => {
      const doc = document as WebkitFullscreenDocument;
      const isFs =
        doc.fullscreenElement === this || doc.webkitFullscreenElement === this;
      this.ui.fullscreenBtn.classList.toggle('fullscreen-active', isFs);
    };
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
    document.addEventListener(
      'webkitfullscreenchange',
      this._onFullscreenChange,
    );

    const container =
      this.shadowRoot!.querySelector<HTMLElement>('#video-container')!;
    container.onclick = (e: MouseEvent) => {
      const id = (e.target as Element).id;
      if (
        id === 'video-container' ||
        id === 'scene-renderer' ||
        id === 'poster'
      ) {
        if (this.paused) this.play();
        else this.pause();
      }
    };

    this.addEventListener('play', () => {
      this.classList.add('playing');
      this.posterImg.classList.add('hidden'); // Hide poster on play
    });
    this.addEventListener('pause', () => this.classList.remove('playing'));
    this.addEventListener('timeupdate', () => this._updateUI());
  }

  get volume() {
    return this._volume;
  }
  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val));
    this._mainAudio.volume = this._volume;
    this._sceneAudio.volume = this._volume;
    this.ui.volume.value = String(this._volume);
    this.ui.muteBtn.classList.toggle('muted', this.volume === 0);
  }

  get src(): string {
    return this.getAttribute('src') ?? '';
  }
  set src(val: string) {
    this.setAttribute('src', val);
  }
  get currentTime() {
    return this._currentTimeMs / 1000;
  }
  set currentTime(sec: number) {
    this.seekTo(sec * 1000);
  }
  get duration() {
    return this._totalDurationMs / 1000;
  }
  get paused() {
    return !this._isPlaying;
  }
  get poster() {
    return this.getAttribute('poster');
  }
  set poster(val: string | null) {
    if (val) this.setAttribute('poster', val);
    else this.removeAttribute('poster');
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (name === 'src' && newVal !== oldVal) this.load();
    if (name === 'poster') this._updatePosterUI(newVal);
  }

  _updatePosterUI(url: string | null) {
    if (url) {
      this.posterImg.src = url;
      // Only show the poster if we haven't started playing yet
      if (!this._isPlaying) {
        this.posterImg.classList.remove('hidden');
      }
    } else {
      this.posterImg.src = '';
      this.posterImg.classList.add('hidden');
    }
  }

  async load() {
    const source = this.src;
    if (!source) return;

    this.pause();
    this.error = null; // Reset error state on new load

    // Show poster while loading if one exists
    if (this.poster) {
      this.posterImg.classList.remove('hidden');
    }

    let data: JsonVideoData | null = null;
    try {
      if (source.startsWith('data:application/json')) {
        const commaIndex = source.indexOf(',');
        data = JSON.parse(decodeURIComponent(source.substring(commaIndex + 1)));
      } else {
        const response = await fetch(source);
        if (!response.ok) {
          // Throw so we catch it below and simulate a network error
          throw new SimulatedMediaError(
            2,
            `Network response was not ok: ${response.status}`,
          );
        }
        data = await response.json();
      }
      this._processLoadedData(data!);
    } catch (e) {
      console.error('JsonVideo load error:', e);
      const message = e instanceof Error ? e.message : String(e);

      this.classList.add('has-error');

      // If it's not our SimulatedMediaError (e.g., a JSON parse error), classify as DECODE error
      this.error =
        e instanceof SimulatedMediaError
          ? e
          : new SimulatedMediaError(3, message);

      // Dispatch standard error event
      this.dispatchEvent(new Event('error'));
    }
  }

  _processLoadedData(data: JsonVideoData) {
    this._videoData = data;
    this._calculateDurations();
    // Drop the previous video's tracks; a stale main track would otherwise
    // play under a video that only has per-scene audio.
    this._resetAudio(this._mainAudio, data.audio);
    this._resetAudio(this._sceneAudio, undefined);
    this._mainAudioPausedByScene = false;
    this._mainAudioResumeTime = 0;
    this._currentSceneIndex = -1;
    this.seekTo(0);
    this.ui.totTime.textContent = this._formatTime(this._totalDurationMs);

    // Dispatch success events similar to native <video>
    this.dispatchEvent(new Event('loadedmetadata'));
    this.dispatchEvent(new Event('loadeddata'));
  }

  // removeAttribute, not src = '': an empty src resolves to the page URL,
  // which still counts as a track everywhere `.src` is tested.
  _resetAudio(el: HTMLAudioElement, src: string | undefined) {
    el.pause();
    if (src) el.src = src;
    else el.removeAttribute('src');
    el.load();
  }

  play() {
    if (!this._videoData || this._isPlaying) return;
    this._isPlaying = true;
    this._lastTimestamp = performance.now();
    this._syncAudioOnStart();
    this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
    this.dispatchEvent(new Event('play'));
  }

  pause() {
    this._isPlaying = false;
    if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId);
    this._mainAudio.pause();
    this._sceneAudio.pause();
    this.dispatchEvent(new Event('pause'));
  }

  seekTo(ms: number) {
    this._currentTimeMs = Math.max(0, Math.min(ms, this._totalDurationMs));
    let idx = this._processedScenes.findIndex(
      s =>
        this._currentTimeMs >= s.startTimeMs &&
        this._currentTimeMs < s.endTimeMs,
    );
    if (idx === -1 && this._currentTimeMs >= this._totalDurationMs)
      idx = this._processedScenes.length - 1;
    if (idx === -1) idx = 0;
    this._currentSceneIndex = idx;
    const scene = this._processedScenes[idx];
    if (this._mainAudio.src) {
      const seekSec = this._currentTimeMs / 1000;
      if (scene?.pauseBackground) {
        this._mainAudio.pause();
        this._mainAudioResumeTime = seekSec;
        this._mainAudioPausedByScene = true;
      } else {
        try {
          this._mainAudio.currentTime = seekSec;
        } catch {
          // Seeking before metadata has loaded throws in some browsers.
        }
        if (this._isPlaying) this._mainAudio.play().catch(() => {});
        this._mainAudioPausedByScene = false;
      }
    }
    this._renderCurrentScene();
    this.dispatchEvent(new Event('timeupdate'));
  }

  _tick(ts: number) {
    if (!this._isPlaying) return;
    const delta = ts - this._lastTimestamp;
    this._lastTimestamp = ts;
    this._currentTimeMs += delta;
    if (this._currentTimeMs >= this._totalDurationMs) {
      this.pause();
      this.seekTo(this._totalDurationMs);
      this.dispatchEvent(new Event('ended'));
      return;
    }
    const newIdx = this._processedScenes.findIndex(
      s => this._currentTimeMs < s.endTimeMs,
    );
    if (newIdx !== this._currentSceneIndex) this._handleSceneTransition(newIdx);
    this.dispatchEvent(new Event('timeupdate'));
    this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
  }

  _updateUI() {
    this.ui.progress.value = String(
      (this._currentTimeMs / this._totalDurationMs) * 100 || 0,
    );
    this.ui.curTime.textContent = this._formatTime(this._currentTimeMs);
    this.ui.progress.style.setProperty(
      '--progress-value',
      this.ui.progress.value + '%',
    );
  }

  _formatTime(ms: number) {
    const s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  _toggleFullscreen() {
    const doc = document as WebkitFullscreenDocument;
    const el = this as WebkitFullscreenElement;
    if (
      doc.fullscreenElement === this ||
      doc.webkitFullscreenElement === this
    ) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('fullscreenchange', this._onFullscreenChange);
    document.removeEventListener(
      'webkitfullscreenchange',
      this._onFullscreenChange,
    );
  }

  _calculateDurations() {
    this._totalDurationMs = 0;
    this._processedScenes = this._videoData!.scenes.map(scene => {
      const dur =
        scene.duration === 'auto' || !scene.duration
          ? scene.speech
            ? Math.max(
                2000,
                scene.speech.split(/\s+/).filter(w => w.length).length * 350,
              )
            : 2000
          : parseFloat(scene.duration) * 1000;
      const start = this._totalDurationMs;
      this._totalDurationMs += dur;
      return {...scene, startTimeMs: start, endTimeMs: this._totalDurationMs};
    });
  }

  _handleSceneTransition(newIdx: number) {
    const prev = this._processedScenes[this._currentSceneIndex],
      next = this._processedScenes[newIdx];
    if (this._mainAudio.src) {
      if (prev?.pauseBackground && this._mainAudioPausedByScene) {
        this._mainAudio.currentTime = this._mainAudioResumeTime;
        this._mainAudio.play().catch(() => {});
        this._mainAudioPausedByScene = false;
      }
      if (next?.pauseBackground) {
        this._mainAudioResumeTime = this._mainAudio.currentTime;
        this._mainAudio.pause();
        this._mainAudioPausedByScene = true;
      }
    }
    this._currentSceneIndex = newIdx;
    this._renderCurrentScene();
  }

  _syncAudioOnStart() {
    const scene = this._processedScenes[this._currentSceneIndex];
    if (this._mainAudio.src) {
      if (scene?.pauseBackground) {
        this._mainAudioResumeTime = this._currentTimeMs / 1000;
        this._mainAudioPausedByScene = true;
      } else {
        this._mainAudio.currentTime = this._currentTimeMs / 1000;
        this._mainAudio.play().catch(() => {});
        this._mainAudioPausedByScene = false;
      }
    }
    this._syncSceneAudio();
  }

  // Runs on play() too, not only on scene changes and seeks.
  _syncSceneAudio() {
    const scene = this._processedScenes[this._currentSceneIndex];
    if (!scene?.audio) {
      this._sceneAudio.pause();
      return;
    }

    if (this._sceneAudio.getAttribute('src') !== scene.audio) {
      this._sceneAudio.src = scene.audio;
      this._sceneAudio.load();
    }

    const sceneTime = (this._currentTimeMs - scene.startTimeMs) / 1000;
    try {
      if (Math.abs(this._sceneAudio.currentTime - sceneTime) > 0.2) {
        this._sceneAudio.currentTime = Math.max(0, sceneTime);
      }
    } catch {
      // Seeking before metadata has loaded throws in some browsers.
    }

    if (this._isPlaying) {
      this._sceneAudio.play().catch(() => {});
    }
  }

  _renderCurrentScene() {
    const scene = this._processedScenes[this._currentSceneIndex];
    if (!scene) return;

    if (scene.html) {
      if (this._currentBlobUrl) {
        URL.revokeObjectURL(this._currentBlobUrl);
      }

      const blob = new Blob(
        [
          `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    *, *::before, *::after {
                        box-sizing: border-box;
                    }
                    body { margin: 0; overflow: hidden; background: transparent; }
                </style>
            </head>
            <body>${scene.html}</body>
            </html>
        `,
        ],
        {type: 'text/html'},
      );

      this._currentBlobUrl = URL.createObjectURL(blob);
      this.renderer.src = this._currentBlobUrl;
    } else {
      this.renderer.src = 'about:blank';
    }

    this.ccText.textContent = scene.speech || '';
    this.ccOverlay.classList.toggle(
      'hidden',
      !(this._showCaptions && scene.speech),
    );

    this._syncSceneAudio();
  }
}
// Register on import. The guard keeps a second copy of this module (two
// bundles on one page) from throwing on an already-defined name.
if (!customElements.get('json-video')) {
  customElements.define('json-video', JsonVideo);
}

declare global {
  interface HTMLElementTagNameMap {
    'json-video': JsonVideo;
  }
}
