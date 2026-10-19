// <json-video> plays a JSON scene list (HTML, speech, audio) through the
// HTMLMediaElement interface, so code written against <video> drives it
// unchanged. Captions come from each scene's `speech` and are exposed as a
// single captions track in `textTracks`. Without the `controls` attribute the
// built-in bar is hidden; children are slotted over the video, so custom
// controls placed inside the element stay visible in fullscreen.

import styles from './jsonVideoStyles';

const NETWORK_EMPTY = 0;
const NETWORK_IDLE = 1;
const NETWORK_LOADING = 2;
const NETWORK_NO_SOURCE = 3;

const HAVE_NOTHING = 0;
const HAVE_METADATA = 1;
const HAVE_CURRENT_DATA = 2;
const HAVE_FUTURE_DATA = 3;
const HAVE_ENOUGH_DATA = 4;

// Chrome's supported playbackRate range; 0 is also accepted.
const MIN_PLAYBACK_RATE = 0.0625;
const MAX_PLAYBACK_RATE = 16;

// Chrome fires timeupdate every 250ms during playback.
const TIMEUPDATE_INTERVAL_MS = 250;

// Simulated MediaError to match native <video> behavior
class SimulatedMediaError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
    this.MEDIA_ERR_ABORTED = 1;
    this.MEDIA_ERR_NETWORK = 2;
    this.MEDIA_ERR_DECODE = 3;
    this.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
  }
}

function indexSizeError(index) {
  return new DOMException(
    `The index provided (${index}) is out of range.`,
    'IndexSizeError',
  );
}

class SimulatedTimeRanges {
  // ranges: [[startSec, endSec], ...], sorted and disjoint.
  constructor(ranges) {
    this._ranges = ranges;
  }
  get length() {
    return this._ranges.length;
  }
  start(i) {
    if (!(i >= 0 && i < this._ranges.length)) throw indexSizeError(i);
    return this._ranges[i][0];
  }
  end(i) {
    if (!(i >= 0 && i < this._ranges.length)) throw indexSizeError(i);
    return this._ranges[i][1];
  }
}

// Dispatches `type` and runs the matching on<type> handler, as the native
// track and cue interfaces do.
class SimulatedEventTarget extends EventTarget {
  _fire(type) {
    const event = new Event(type);
    const handler = this['on' + type];
    if (typeof handler === 'function') handler.call(this, event);
    this.dispatchEvent(event);
  }
}

class SimulatedList {
  constructor(items) {
    items.forEach((item, i) => (this[i] = item));
    this.length = items.length;
  }
  [Symbol.iterator]() {
    return Array.prototype.values.call(this);
  }
}

class SimulatedTextTrackCueList extends SimulatedList {
  getCueById(id) {
    return Array.from(this).find(cue => cue.id === id) || null;
  }
}

class SimulatedTextTrackCue extends SimulatedEventTarget {
  constructor(track, startTime, endTime, text) {
    super();
    this.track = track;
    this.id = '';
    this.startTime = startTime;
    this.endTime = endTime;
    this.text = text;
    this.pauseOnExit = false;
    this.onenter = null;
    this.onexit = null;
  }
}

const TEXT_TRACK_MODES = ['disabled', 'hidden', 'showing'];

class SimulatedTextTrack extends SimulatedEventTarget {
  constructor(onModeChange) {
    super();
    this.kind = 'captions';
    this.label = 'Captions';
    this.language = '';
    this.id = '';
    this.inBandMetadataTrackDispatchType = '';
    this.oncuechange = null;
    this._mode = 'disabled';
    this._cues = [];
    this._activeCues = [];
    this._onModeChange = onModeChange;
  }
  get mode() {
    return this._mode;
  }
  set mode(value) {
    // Native tracks ignore values outside the enum.
    if (!TEXT_TRACK_MODES.includes(value) || value === this._mode) return;
    this._mode = value;
    this._onModeChange(this);
  }
  get cues() {
    return this._mode === 'disabled'
      ? null
      : new SimulatedTextTrackCueList(this._cues);
  }
  get activeCues() {
    return this._mode === 'disabled'
      ? null
      : new SimulatedTextTrackCueList(this._activeCues);
  }
}

class SimulatedTextTrackList extends SimulatedList {
  constructor(tracks) {
    super(tracks);
    // SimulatedList cannot extend EventTarget too; delegate to one.
    this._events = new SimulatedEventTarget();
    this.onchange = null;
    this.onaddtrack = null;
    this.onremovetrack = null;
    this._changeQueued = false;
  }
  getTrackById(id) {
    return Array.from(this).find(track => track.id === id) || null;
  }
  addEventListener(...args) {
    this._events.addEventListener(...args);
  }
  removeEventListener(...args) {
    this._events.removeEventListener(...args);
  }
  dispatchEvent(event) {
    return this._events.dispatchEvent(event);
  }
  _queueChange() {
    if (this._changeQueued) return;
    this._changeQueued = true;
    setTimeout(() => {
      this._changeQueued = false;
      const event = new Event('change');
      if (typeof this.onchange === 'function') this.onchange(event);
      this.dispatchEvent(event);
    }, 0);
  }
}

export class JsonVideo extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'controls', 'poster'];
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._videoData = null;
    this._processedScenes = [];
    this._sceneCues = [];
    this._totalDurationMs = 0;
    this._currentTimeMs = 0;
    this._defaultStartMs = 0;
    this._paused = true;
    // True while the clock runs: not paused and data is loaded.
    this._isPlaying = false;
    this._seeking = false;
    this._currentSceneIndex = -1;
    this._lastTimestamp = 0;
    this._lastTimeupdateTs = 0;
    this._animationFrameId = null;
    this._volume = 1.0;
    this._muted = false;
    this._mutedAttributeApplied = false;
    this._playbackRate = 1.0;
    this._defaultPlaybackRate = 1.0;
    this._networkState = NETWORK_EMPTY;
    this._readyState = HAVE_NOTHING;
    this._currentSrc = '';
    this._error = null;
    this._playedRanges = [];
    this._pendingPlayPromises = [];
    this._loadToken = 0;
    this._showPoster = true;

    this._captionTrack = new SimulatedTextTrack(() =>
      this._onCaptionModeChange(),
    );
    this._textTracks = new SimulatedTextTrackList([this._captionTrack]);

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
            <img id="poster" part="poster" class="hidden" alt="">
            <iframe id="scene-renderer" part="scene" src="about:blank" scrolling="no" sandbox="allow-scripts"></iframe>
            <div id="closed-caption-overlay" part="captions" class="hidden"><span class="cc-text" part="caption-text"></span></div>
            <div id="slot-layer"><slot></slot></div>
            <div id="controls-bar" part="controls-bar">
                <div class="controls-row">
                    <button id="play-btn" part="play-button" class="control-btn" aria-label="Play"></button>
                    <div class="volume-control">
                        <button id="mute-btn" part="mute-button" class="control-btn" aria-label="Mute"></button>
                        <input type="range" id="volume-slider" part="volume-slider" aria-label="Volume" min="0" max="1" step="0.05" value="1">
                    </div>
                    <div class="time-display" part="time-display">
                        <span id="cur-time" part="current-time">0:00</span> / <span id="tot-time" part="duration">0:00</span>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <button id="cc-btn" part="captions-button" class="control-btn disabled hidden" aria-label="Captions" aria-pressed="false"></button>
                    <button id="fullscreen-btn" part="fullscreen-button" class="control-btn" aria-label="Enter full screen"></button>
                </div>
                <div id="progress-container">
                    <input type="range" id="progress-bar" part="progress-bar" aria-label="Seek" min="0" max="100" value="0" step="0.1">
                </div>
            </div>
        `;

    this.shadowRoot.appendChild(styleElement);
    this.shadowRoot.appendChild(container);

    this.renderer = this.shadowRoot.querySelector('#scene-renderer');
    this.posterImg = this.shadowRoot.querySelector('#poster');
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
      fullscreenBtn: this.shadowRoot.querySelector('#fullscreen-btn'),
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
    this.ui.playBtn.onclick = () => this._togglePlay();
    this.ui.progress.oninput = e => {
      if (this._readyState === HAVE_NOTHING) return;
      this.currentTime =
        ((parseFloat(e.target.value) / 100) * this._totalDurationMs) / 1000;
    };
    this.ui.volume.oninput = e => {
      const volume = parseFloat(e.target.value);
      this.volume = volume;
      if (volume > 0) this.muted = false;
    };

    this.ui.muteBtn.onclick = () => {
      this.muted = !this.muted;
      if (!this.muted && this.volume === 0) this.volume = 1.0;
    };

    this.ui.ccBtn.onclick = () => {
      this._captionTrack.mode =
        this._captionTrack.mode === 'showing' ? 'disabled' : 'showing';
    };

    this.ui.fullscreenBtn.onclick = () => this._toggleFullscreen();

    this._onFullscreenChange = () => {
      const isFs =
        document.fullscreenElement === this ||
        document.webkitFullscreenElement === this;
      this.ui.fullscreenBtn.classList.toggle('fullscreen-active', isFs);
      this._togglePartState(this.ui.fullscreenBtn, 'fullscreen', isFs);
      this.ui.fullscreenBtn.setAttribute(
        'aria-label',
        isFs ? 'Exit full screen' : 'Enter full screen',
      );
    };
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
    document.addEventListener(
      'webkitfullscreenchange',
      this._onFullscreenChange,
    );

    this.shadowRoot.querySelector('#video-container').onclick = e => {
      // Like <video>, clicking the picture toggles playback only with controls.
      if (
        this.controls &&
        (e.target.id === 'video-container' ||
          e.target.id === 'scene-renderer' ||
          e.target.id === 'poster')
      ) {
        this._togglePlay();
      }
    };
  }

  _togglePlay() {
    if (this.paused) this.play().catch(() => {});
    else this.pause();
  }

  // Reflected boolean attributes, as on HTMLMediaElement.
  get controls() {
    return this.hasAttribute('controls');
  }
  set controls(val) {
    this.toggleAttribute('controls', Boolean(val));
  }
  get autoplay() {
    return this.hasAttribute('autoplay');
  }
  set autoplay(val) {
    this.toggleAttribute('autoplay', Boolean(val));
  }
  get loop() {
    return this.hasAttribute('loop');
  }
  set loop(val) {
    this.toggleAttribute('loop', Boolean(val));
  }
  get defaultMuted() {
    return this.hasAttribute('muted');
  }
  set defaultMuted(val) {
    this.toggleAttribute('muted', Boolean(val));
  }

  get src() {
    return this._resolveUrlAttribute('src');
  }
  set src(val) {
    this.setAttribute('src', val);
  }
  get currentSrc() {
    return this._currentSrc;
  }
  get poster() {
    return this._resolveUrlAttribute('poster');
  }
  set poster(val) {
    if (val) this.setAttribute('poster', val);
    else this.removeAttribute('poster');
  }

  _resolveUrlAttribute(name) {
    const value = this.getAttribute(name);
    if (value === null) return '';
    try {
      return new URL(value, document.baseURI).href;
    } catch {
      return value;
    }
  }

  get error() {
    return this._error;
  }
  get networkState() {
    return this._networkState;
  }
  get readyState() {
    return this._readyState;
  }
  get seeking() {
    return this._seeking;
  }
  get paused() {
    return this._paused;
  }
  get ended() {
    return (
      this._readyState >= HAVE_METADATA &&
      this._currentTimeMs >= this._totalDurationMs &&
      !this.loop
    );
  }

  get currentTime() {
    if (this._readyState === HAVE_NOTHING) return this._defaultStartMs / 1000;
    return this._currentTimeMs / 1000;
  }
  set currentTime(sec) {
    sec = Number(sec);
    if (!Number.isFinite(sec)) {
      throw new TypeError(
        "Failed to set the 'currentTime' property: The provided double value is non-finite.",
      );
    }
    this._seek(sec * 1000);
  }
  fastSeek(sec) {
    this.currentTime = sec;
  }
  // Milliseconds; kept for existing callers. Prefer currentTime.
  seekTo(ms) {
    this._seek(ms);
  }

  get duration() {
    if (this._readyState === HAVE_NOTHING) return NaN;
    return this._totalDurationMs / 1000;
  }

  get volume() {
    return this._volume;
  }
  set volume(val) {
    val = Number(val);
    if (!Number.isFinite(val)) {
      throw new TypeError(
        "Failed to set the 'volume' property: The provided double value is non-finite.",
      );
    }
    if (val < 0 || val > 1) {
      throw new DOMException(
        `The volume provided (${val}) is outside the range [0, 1].`,
        'IndexSizeError',
      );
    }
    if (val === this._volume) return;
    this._volume = val;
    this._mainAudio.volume = val;
    this._sceneAudio.volume = val;
    this._updateVolumeUI();
    this.dispatchEvent(new Event('volumechange'));
  }

  get muted() {
    return this._muted;
  }
  set muted(val) {
    this._mutedAttributeApplied = true;
    val = Boolean(val);
    if (val === this._muted) return;
    this._muted = val;
    this._mainAudio.muted = val;
    this._sceneAudio.muted = val;
    this._updateVolumeUI();
    this.dispatchEvent(new Event('volumechange'));
  }

  _updateVolumeUI() {
    this.ui.volume.value = this._muted ? 0 : this._volume;
    const silent = this._muted || this._volume === 0;
    this.ui.muteBtn.classList.toggle('muted', silent);
    this._togglePartState(this.ui.muteBtn, 'muted', silent);
    this.ui.muteBtn.setAttribute('aria-label', silent ? 'Unmute' : 'Mute');
  }

  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(val) {
    val = this._validatePlaybackRate(val, 'playbackRate');
    if (val === this._playbackRate) return;
    this._playbackRate = val;
    this._applyAudioRate(this._mainAudio);
    this._applyAudioRate(this._sceneAudio);
    this.dispatchEvent(new Event('ratechange'));
  }
  get defaultPlaybackRate() {
    return this._defaultPlaybackRate;
  }
  set defaultPlaybackRate(val) {
    val = this._validatePlaybackRate(val, 'defaultPlaybackRate');
    if (val === this._defaultPlaybackRate) return;
    this._defaultPlaybackRate = val;
    this.dispatchEvent(new Event('ratechange'));
  }

  _validatePlaybackRate(val, name) {
    val = Number(val);
    if (!Number.isFinite(val)) {
      throw new TypeError(
        `Failed to set the '${name}' property: The provided double value is non-finite.`,
      );
    }
    if (val !== 0 && (val < MIN_PLAYBACK_RATE || val > MAX_PLAYBACK_RATE)) {
      throw new DOMException(
        `The provided playback rate (${val}) is not in the supported playback range.`,
        'NotSupportedError',
      );
    }
    return val;
  }

  _applyAudioRate(el) {
    // Audio elements cannot run at 0; the clock stops instead.
    if (this._playbackRate === 0) return;
    try {
      el.playbackRate = this._playbackRate;
    } catch {
      // The rate is valid for <json-video>; an audio element may still refuse it.
    }
  }

  get buffered() {
    return new SimulatedTimeRanges(this._wholeRange());
  }
  get seekable() {
    return new SimulatedTimeRanges(this._wholeRange());
  }
  get played() {
    return new SimulatedTimeRanges(this._playedRanges.map(r => [...r]));
  }

  // The whole video is in memory once loaded.
  _wholeRange() {
    return this._readyState === HAVE_NOTHING ? [] : [[0, this.duration]];
  }

  _addPlayed(fromMs, toMs) {
    if (!(toMs > fromMs)) return;
    let start = fromMs / 1000,
      end = toMs / 1000;
    const kept = [];
    for (const [s, e] of this._playedRanges) {
      if (e < start || s > end) {
        kept.push([s, e]);
      } else {
        start = Math.min(start, s);
        end = Math.max(end, e);
      }
    }
    kept.push([start, end]);
    this._playedRanges = kept.sort((a, b) => a[0] - b[0]);
  }

  get textTracks() {
    return this._textTracks;
  }

  canPlayType(type) {
    return /^\s*application\/json\s*(;|$)/i.test(type) ? 'probably' : '';
  }

  connectedCallback() {
    // As on <video>, the muted attribute sets the initial state only.
    if (this._mutedAttributeApplied) return;
    this._mutedAttributeApplied = true;
    if (this.defaultMuted) this.muted = true;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'src' && newVal !== null && newVal !== oldVal) this.load();
    if (name === 'poster') this._updatePosterUI();
  }

  _updatePosterUI() {
    const url = this.getAttribute('poster');
    if (url) {
      this.posterImg.src = url;
      this.posterImg.classList.toggle('hidden', !this._showPoster);
    } else {
      this.posterImg.removeAttribute('src');
      this.posterImg.classList.add('hidden');
    }
  }

  async load() {
    const token = ++this._loadToken;

    this._rejectPendingPlay(
      new DOMException(
        'The play() request was interrupted by a new load request.',
        'AbortError',
      ),
    );
    if (
      this._networkState === NETWORK_LOADING ||
      this._networkState === NETWORK_IDLE
    ) {
      this.dispatchEvent(new Event('abort'));
    }
    if (this._networkState !== NETWORK_EMPTY) {
      this.dispatchEvent(new Event('emptied'));
    }
    this._resetMediaState();

    const source = this.getAttribute('src');
    if (!source) return;

    this._networkState = NETWORK_LOADING;
    this._currentSrc = this.src;
    // As on <video>, loading events never fire from inside the src setter.
    await Promise.resolve();
    if (token !== this._loadToken) return;
    this.dispatchEvent(new Event('loadstart'));

    let data = null;
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
      if (token !== this._loadToken) return;
      this._processLoadedData(data);
    } catch (e) {
      if (token !== this._loadToken) return;
      console.error('JsonVideo load error:', e);

      this.classList.add('has-error');

      // If it's not our SimulatedMediaError (e.g., a JSON parse error), classify as DECODE error
      this._error =
        e instanceof SimulatedMediaError
          ? e
          : new SimulatedMediaError(3, e.message);
      this._networkState =
        this._readyState === HAVE_NOTHING ? NETWORK_NO_SOURCE : NETWORK_IDLE;
      this._readyState = HAVE_NOTHING;
      this._paused = true;
      this._syncPlayingUI();
      this._showPoster = true;
      this._updatePosterUI();

      this.dispatchEvent(new Event('error'));
      this._rejectPendingPlay(
        new DOMException(
          'Failed to load because no supported source was found.',
          'NotSupportedError',
        ),
      );
    }
  }

  // The media element load algorithm's reset: drop the old video and state.
  _resetMediaState() {
    this._stopClock();
    if (!this._paused) {
      this._paused = true;
      this._syncPlayingUI();
    }
    this._networkState = NETWORK_EMPTY;
    this._readyState = HAVE_NOTHING;
    this._error = null;
    this.classList.remove('has-error');
    this._currentSrc = '';
    this._videoData = null;
    this._processedScenes = [];
    this._sceneCues = [];
    this._captionTrack._cues = [];
    this._setActiveCue(null);
    this._totalDurationMs = 0;
    this._currentTimeMs = 0;
    this._defaultStartMs = 0;
    this._currentSceneIndex = -1;
    this._playedRanges = [];
    this._seeking = false;
    this._resetAudio(this._mainAudio, null);
    this._resetAudio(this._sceneAudio, null);
    this._mainAudioPausedByScene = false;
    this._mainAudioResumeTime = 0;
    if (this._currentBlobUrl) {
      URL.revokeObjectURL(this._currentBlobUrl);
      this._currentBlobUrl = null;
    }
    this.renderer.src = 'about:blank';
    this.ui.totTime.textContent = this._formatTime(0);
    this._updateUI();
    this._updateCaptionUI();
    this._showPoster = true;
    this._updatePosterUI();
    if (this._playbackRate !== this._defaultPlaybackRate) {
      this.playbackRate = this._defaultPlaybackRate;
    }
  }

  _processLoadedData(data) {
    this._videoData = data;
    this._calculateDurations();
    this._buildCues();
    // Even when the new video has no main track, the old one must not survive.
    this._resetAudio(this._mainAudio, data.audio);
    this._resetAudio(this._sceneAudio, null);
    this._mainAudioPausedByScene = false;
    this._mainAudioResumeTime = 0;
    this._currentSceneIndex = -1;
    this.ui.totTime.textContent = this._formatTime(this._totalDurationMs);

    this._networkState = NETWORK_IDLE;
    this._readyState = HAVE_METADATA;
    this.dispatchEvent(new Event('durationchange'));
    this.dispatchEvent(new Event('loadedmetadata'));

    // A currentTime set before metadata arrived is the start position.
    const startMs = this._defaultStartMs;
    this._defaultStartMs = 0;
    this._setTime(startMs);
    if (startMs > 0) this._showPoster = false;
    this._updatePosterUI();

    this._readyState = HAVE_ENOUGH_DATA;
    this.dispatchEvent(new Event('loadeddata'));
    this.dispatchEvent(new Event('canplay'));
    if (!this._paused) {
      this._startClock();
      this.dispatchEvent(new Event('playing'));
      this._resolvePendingPlay();
    } else if (this.autoplay) {
      this.play().catch(() => {});
    }
    this.dispatchEvent(new Event('canplaythrough'));
  }

  _resetAudio(el, src) {
    el.pause();
    if (src) el.src = src;
    // src = '' is a real URL (the page's own); only removal clears the track.
    else el.removeAttribute('src');
    el.load();
    // load() resets an audio element's playbackRate.
    this._applyAudioRate(el);
  }

  play() {
    if (this._error || !this.getAttribute('src')) {
      return Promise.reject(
        new DOMException(
          'The element has no supported sources.',
          'NotSupportedError',
        ),
      );
    }
    if (this.ended) this._seek(0);

    const promise = new Promise((resolve, reject) =>
      this._pendingPlayPromises.push({resolve, reject}),
    );
    if (this._paused) {
      this._paused = false;
      this._showPoster = false;
      this._updatePosterUI();
      this._syncPlayingUI();
      this.dispatchEvent(new Event('play'));
      if (this._readyState >= HAVE_FUTURE_DATA) {
        this._startClock();
        this.dispatchEvent(new Event('playing'));
      } else {
        this.dispatchEvent(new Event('waiting'));
      }
    }
    if (this._readyState >= HAVE_FUTURE_DATA) this._resolvePendingPlay();
    return promise;
  }

  pause() {
    if (this._paused) return;
    this._paused = true;
    this._stopClock();
    this._syncPlayingUI();
    this.dispatchEvent(new Event('timeupdate'));
    this.dispatchEvent(new Event('pause'));
    this._rejectPendingPlay(
      new DOMException(
        'The play() request was interrupted by a call to pause().',
        'AbortError',
      ),
    );
  }

  _resolvePendingPlay() {
    const pending = this._pendingPlayPromises;
    this._pendingPlayPromises = [];
    pending.forEach(p => p.resolve());
  }

  _rejectPendingPlay(error) {
    const pending = this._pendingPlayPromises;
    this._pendingPlayPromises = [];
    pending.forEach(p => p.reject(error));
  }

  // A page cannot see the classes inside the shadow root, so button states are
  // also part names, styled from outside as e.g. ::part(mute-button muted).
  _togglePartState(el, state, on) {
    const names = (el.getAttribute('part') || '')
      .split(/\s+/)
      .filter(name => name && name !== state);
    if (on) names.push(state);
    el.setAttribute('part', names.join(' '));
  }

  _syncPlayingUI() {
    this.classList.toggle('playing', !this._paused);
    this._togglePartState(this.ui.playBtn, 'playing', !this._paused);
    this.ui.playBtn.setAttribute('aria-label', this._paused ? 'Play' : 'Pause');
  }

  _startClock() {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this._lastTimestamp = performance.now();
    this._lastTimeupdateTs = this._lastTimestamp;
    this._syncAudioOnStart();
    this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
  }

  _stopClock() {
    this._isPlaying = false;
    if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId);
    this._animationFrameId = null;
    this._mainAudio.pause();
    this._sceneAudio.pause();
  }

  _seek(ms) {
    if (this._readyState === HAVE_NOTHING) {
      this._defaultStartMs = Math.max(0, ms);
      return;
    }
    this._seeking = true;
    this._showPoster = false;
    this._updatePosterUI();
    this.dispatchEvent(new Event('seeking'));
    this._setTime(ms);
    this._lastTimeupdateTs = performance.now();
    this.dispatchEvent(new Event('timeupdate'));
    this._seeking = false;
    this.dispatchEvent(new Event('seeked'));
  }

  _setTime(ms) {
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
          // Some browsers throw until the audio has metadata.
        }
        if (this._isPlaying) this._mainAudio.play().catch(() => {});
        this._mainAudioPausedByScene = false;
      }
    }
    this._renderCurrentScene();
    this._updateUI();
  }

  _tick(ts) {
    if (!this._isPlaying) return;
    const delta = Math.max(0, ts - this._lastTimestamp) * this._playbackRate;
    this._lastTimestamp = ts;
    const fromMs = this._currentTimeMs;
    this._currentTimeMs += delta;
    if (this._currentTimeMs >= this._totalDurationMs) {
      this._addPlayed(fromMs, this._totalDurationMs);
      if (this.loop) {
        this._seek(0);
        this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
        return;
      }
      this._setTime(this._totalDurationMs);
      this.dispatchEvent(new Event('timeupdate'));
      this._paused = true;
      this._stopClock();
      this._syncPlayingUI();
      this.dispatchEvent(new Event('pause'));
      this.dispatchEvent(new Event('ended'));
      return;
    }
    this._addPlayed(fromMs, this._currentTimeMs);
    const newIdx = this._processedScenes.findIndex(
      s => this._currentTimeMs < s.endTimeMs,
    );
    if (newIdx !== this._currentSceneIndex) this._handleSceneTransition(newIdx);
    this._updateUI();
    if (ts - this._lastTimeupdateTs >= TIMEUPDATE_INTERVAL_MS) {
      this._lastTimeupdateTs = ts;
      this.dispatchEvent(new Event('timeupdate'));
    }
    this._animationFrameId = requestAnimationFrame(ts => this._tick(ts));
  }

  _updateUI() {
    this.ui.progress.value =
      (this._currentTimeMs / this._totalDurationMs) * 100 || 0;
    this.ui.curTime.textContent = this._formatTime(this._currentTimeMs);
    this.ui.progress.style.setProperty(
      '--progress-value',
      this.ui.progress.value + '%',
    );
  }

  _formatTime(ms) {
    const s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  _toggleFullscreen() {
    if (
      document.fullscreenElement === this ||
      document.webkitFullscreenElement === this
    ) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (this.requestFullscreen || this.webkitRequestFullscreen).call(this);
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
    this._processedScenes = this._videoData.scenes.map(scene => {
      let dur =
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

  _buildCues() {
    this._sceneCues = this._processedScenes.map(scene =>
      scene.speech
        ? new SimulatedTextTrackCue(
            this._captionTrack,
            scene.startTimeMs / 1000,
            scene.endTimeMs / 1000,
            scene.speech,
          )
        : null,
    );
    this._captionTrack._cues = this._sceneCues.filter(Boolean);
    this._updateCaptionUI();
  }

  _onCaptionModeChange() {
    this._updateActiveCue();
    this._updateCaptionUI();
    this._textTracks._queueChange();
  }

  _updateActiveCue() {
    const cue =
      this._captionTrack.mode === 'disabled'
        ? null
        : this._sceneCues[this._currentSceneIndex] || null;
    this._setActiveCue(cue);
  }

  _setActiveCue(cue) {
    const track = this._captionTrack;
    const prev = track._activeCues[0] || null;
    if (prev === cue) return;
    track._activeCues = cue ? [cue] : [];
    // Disabling a track clears its cues without events.
    if (track.mode === 'disabled') return;
    if (prev) prev._fire('exit');
    if (cue) cue._fire('enter');
    track._fire('cuechange');
  }

  _updateCaptionUI() {
    const showing = this._captionTrack.mode === 'showing';
    const cue = this._captionTrack._activeCues[0];
    this.ccText.textContent = cue ? cue.text : '';
    this.ccOverlay.classList.toggle('hidden', !(showing && cue));
    this.ui.ccBtn.classList.toggle('disabled', !showing);
    this.ui.ccBtn.classList.toggle(
      'hidden',
      this._captionTrack._cues.length === 0,
    );
    this.ui.ccBtn.setAttribute('aria-pressed', String(showing));
    this._togglePartState(this.ui.ccBtn, 'captions-on', showing);
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
    this._syncSceneAudio();
  }

  _syncSceneAudio() {
    const scene = this._processedScenes[this._currentSceneIndex];
    if (!scene?.audio) {
      this._sceneAudio.pause();
      return;
    }

    if (this._sceneAudio.getAttribute('src') !== scene.audio) {
      this._sceneAudio.src = scene.audio;
      this._sceneAudio.load();
      this._applyAudioRate(this._sceneAudio);
    }

    const sceneTime = (this._currentTimeMs - scene.startTimeMs) / 1000;
    try {
      if (Math.abs(this._sceneAudio.currentTime - sceneTime) > 0.2) {
        this._sceneAudio.currentTime = Math.max(0, sceneTime);
      }
    } catch {
      // Some browsers throw until the audio has metadata.
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

    this._updateActiveCue();
    this._updateCaptionUI();

    this._syncSceneAudio();
  }
}

for (const [name, value] of Object.entries({
  NETWORK_EMPTY,
  NETWORK_IDLE,
  NETWORK_LOADING,
  NETWORK_NO_SOURCE,
  HAVE_NOTHING,
  HAVE_METADATA,
  HAVE_CURRENT_DATA,
  HAVE_FUTURE_DATA,
  HAVE_ENOUGH_DATA,
})) {
  Object.defineProperty(JsonVideo, name, {value, enumerable: true});
  Object.defineProperty(JsonVideo.prototype, name, {value, enumerable: true});
}

customElements.define('json-video', JsonVideo);
