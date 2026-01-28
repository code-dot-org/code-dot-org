import styles from './json-video-styles';

export class JsonVideo extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'controls'];
  }

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

    this._mainAudio = new Audio();
    this._sceneAudio = new Audio();

    this._mainAudio.crossOrigin = 'anonymous';
    this._sceneAudio.crossOrigin = 'anonymous';

    this.shadowRoot.appendChild(this._mainAudio);
    this.shadowRoot.appendChild(this._sceneAudio);

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
            <iframe id="scene-renderer" src="about:blank" scrolling="no"></iframe>
            <div id="closed-caption-overlay" class="hidden"><span class="cc-text"></span></div>
            <div id="controls-bar">
                <div id="progress-container">
                    <input type="range" id="progress-bar" min="0" max="100" value="0" step="0.1">
                </div>
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
                </div>
            </div>
        `;

    this.shadowRoot.appendChild(styleElement);
    this.shadowRoot.appendChild(container);

    this.renderer = this.shadowRoot.querySelector('#scene-renderer');
    this.ccOverlay = this.shadowRoot.querySelector('#closed-caption-overlay');
    this.ccText = this.shadowRoot.querySelector('.cc-text');

    this.ui = {
      playBtn: this.shadowRoot.querySelector('#play-btn'),
      muteBtn: this.shadowRoot.querySelector('#mute-btn'),
      progress: this.shadowRoot.querySelector('#progress-bar'),
      curTime: this.shadowRoot.querySelector('#cur-time'),
      totTime: this.shadowRoot.querySelector('#tot-time'),
      volume: this.shadowRoot.querySelector('#volume-slider'),
      ccBtn: this.shadowRoot.querySelector('#cc-btn'),
    };

    this._bindEvents();
  }

  _bindEvents() {
    this.ui.playBtn.onclick = () => (this.paused ? this.play() : this.pause());
    this.ui.progress.oninput = e =>
      this.seekTo((parseFloat(e.target.value) / 100) * this._totalDurationMs);
    this.ui.volume.oninput = e => (this.volume = parseFloat(e.target.value));

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

    this.shadowRoot.querySelector('#video-container').onclick = e => {
      if (
        e.target.id === 'video-container' ||
        e.target.id === 'scene-renderer'
      ) {
        this.paused ? this.play() : this.pause();
      }
    };

    this.addEventListener('play', () => this.classList.add('playing'));
    this.addEventListener('pause', () => this.classList.remove('playing'));
    this.addEventListener('timeupdate', () => this._updateUI());
  }

  get volume() {
    return this._volume;
  }
  set volume(val) {
    this._volume = Math.max(0, Math.min(1, val));
    this._mainAudio.volume = this._volume;
    this._sceneAudio.volume = this._volume;
    this.ui.volume.value = this._volume;
    this.ui.muteBtn.classList.toggle('muted', this.volume === 0);
  }

  get src() {
    return this.getAttribute('src');
  }
  set src(val) {
    this.setAttribute('src', val);
  }
  get currentTime() {
    return this._currentTimeMs / 1000;
  }
  set currentTime(sec) {
    this.seekTo(sec * 1000);
  }
  get duration() {
    return this._totalDurationMs / 1000;
  }
  get paused() {
    return !this._isPlaying;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'src' && newVal) this.load();
  }

  async load() {
    const source = this.src;
    if (!source) return;
    this.pause();
    let data = null;
    try {
      if (source.startsWith('data:application/json')) {
        const commaIndex = source.indexOf(',');
        data = JSON.parse(decodeURIComponent(source.substring(commaIndex + 1)));
      } else {
        const response = await fetch(source);
        data = await response.json();
      }
      this._processLoadedData(data);
    } catch (e) {
      console.error('JsonVideo load error:', e);
    }
  }

  _processLoadedData(data) {
    this._videoData = data;
    this._calculateDurations();
    if (data.audio) {
      this._mainAudio.src = data.audio;
      this._mainAudio.load();
    }
    this.seekTo(0);
    this.ui.totTime.textContent = this._formatTime(this._totalDurationMs);
    this.dispatchEvent(new Event('loadedmetadata'));
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

  seekTo(ms) {
    this._currentTimeMs = Math.max(0, Math.min(ms, this._totalDurationMs));
    let idx = this._processedScenes.findIndex(
      s =>
        this._currentTimeMs >= s.startTimeMs &&
        this._currentTimeMs < s.endTimeMs
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
        } catch (e) {}
        if (this._isPlaying) this._mainAudio.play().catch(() => {});
        this._mainAudioPausedByScene = false;
      }
    }
    this._renderCurrentScene();
    this.dispatchEvent(new Event('timeupdate'));
  }

  _tick(ts) {
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
      s => this._currentTimeMs < s.endTimeMs
    );
    if (newIdx !== this._currentSceneIndex) this._handleSceneTransition(newIdx);
    this.dispatchEvent(new Event('timeupdate'));
    this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
  }

  _updateUI() {
    this.ui.progress.value =
      (this._currentTimeMs / this._totalDurationMs) * 100 || 0;
    this.ui.curTime.textContent = this._formatTime(this._currentTimeMs);
  }

  _formatTime(ms) {
    const s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  _calculateDurations() {
    this._totalDurationMs = 0;
    this._processedScenes = this._videoData.scenes.map(scene => {
      let dur =
        scene.duration === 'auto' || !scene.duration
          ? scene.speech
            ? Math.max(
                2000,
                scene.speech.split(/\s+/).filter(w => w.length).length * 350
              )
            : 2000
          : parseFloat(scene.duration) * 1000;
      const start = this._totalDurationMs;
      this._totalDurationMs += dur;
      return {...scene, startTimeMs: start, endTimeMs: this._totalDurationMs};
    });
  }

  _handleSceneTransition(newIdx) {
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
  }

  _renderCurrentScene() {
    const scene = this._processedScenes[this._currentSceneIndex];
    if (!scene) return;

    // 1. Handle HTML Rendering via Blob URL
    if (scene.html) {
      // Clean up previous blob to prevent memory leaks
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
                    body { margin: 0; overflow: hidden; background: transparent; }
                </style>
            </head>
            <body>${scene.html}</body>
            </html>
        `,
        ],
        {type: 'text/html'}
      );

      this._currentBlobUrl = URL.createObjectURL(blob);
      this.renderer.src = this._currentBlobUrl;
    } else {
      this.renderer.src = 'about:blank';
    }

    // 2. Handle Captions
    this.ccText.textContent = scene.speech || '';
    this.ccOverlay.classList.toggle(
      'hidden',
      !(this._showCaptions && scene.speech)
    );

    // 3. Handle Audio Synchronization
    const sceneTime = (this._currentTimeMs - scene.startTimeMs) / 1000;
    if (scene.audio) {
      if (this._sceneAudio.getAttribute('src') !== scene.audio) {
        this._sceneAudio.src = scene.audio;
        this._sceneAudio.load();
      }

      // Only sync if the drift is significant (>200ms)
      try {
        if (Math.abs(this._sceneAudio.currentTime - sceneTime) > 0.2) {
          this._sceneAudio.currentTime = Math.max(0, sceneTime);
        }
      } catch (e) {}

      if (this._isPlaying) {
        this._sceneAudio.play().catch(() => {});
      }
    } else {
      this._sceneAudio.pause();
    }
  }
}
customElements.define('json-video', JsonVideo);
