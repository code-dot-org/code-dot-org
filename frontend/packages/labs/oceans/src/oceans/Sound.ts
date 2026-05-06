/* eslint-disable */

/** Configuration options for a Sound instance. */
export interface SoundConfig {
  id?: string;
  mp3?: string;
  ogg?: string;
  wav?: string;
  allowHTML5Mobile?: boolean;
  playAfterLoad?: boolean;
  forceHTML5?: boolean;
  playAfterLoadOptions?: SoundOptions;
  onPreloadError?: (status?: number) => void;
}

/** Options passed to Sound.play() or Sound.playAfterLoad(). */
export interface SoundOptions {
  volume?: number;
  loop?: boolean;
  onEnded?: () => void;
  callback?: (success: boolean) => void;
  forceHTML5?: boolean;
  allowHTML5Mobile?: boolean;
}

function isMobile(): boolean {
  return 'ontouchstart' in document.documentElement;
}

function isIE9(): boolean {
  /** @type {number} */
  var version = -1;

  if (/MSIE\s([\d.]+)/.test(navigator.userAgent)) {
    version = parseInt(RegExp.$1);
  }

  return version === 9;
}

/**
 * Manages loading and playback of a single audio asset using either
 * Web Audio API or HTML5 Audio, with automatic fallback between them.
 */
export default class Sound {
  config: SoundConfig;
  audioContext: AudioContext | null;
  audioElement: HTMLAudioElement | null;
  reusableBuffer: AudioBuffer | null;
  playableBuffer: AudioBufferSourceNode | null;
  gainNode?: GainNode | null;
  onLoad?: () => void;

  /** @private Whether the sound is currently playing. */
  private isPlaying_: boolean;

  /** @private Whether the sound has finished loading. */
  private isLoaded_: boolean;

  /** @private Whether the sound failed to load. */
  private didLoadFail_: boolean;

  /**
   * @param config - Available sound files and playback options for this audio.
   * @param audioContext - Web Audio context, or null to fall back to HTML5 Audio.
   */
  constructor(config: SoundConfig, audioContext: AudioContext | null) {
    this.config = config;
    this.audioContext = audioContext;
    this.audioElement = null;
    this.reusableBuffer = null;
    this.playableBuffer = null;
    this.isPlaying_ = false;
    this.isLoaded_ = false;
    this.didLoadFail_ = false;
  }

  /**
   * Begin playback of the sound.
   *
   * @param options - Optional playback parameters (volume, loop, callbacks).
   */
  play(options?: SoundOptions): void {
    options = options || {};
    if (!this.audioElement && !this.reusableBuffer) {
      this.handlePlayFailed(options);
      return;
    }

    if (this.reusableBuffer) {
      const buf = this.newPlayableBufferSource(this.reusableBuffer, options);
      if (!buf) {
        this.handlePlayFailed(options);
        return;
      }
      this.playableBuffer = buf;

      this.playableBuffer.onended = function (this: Sound) {
        this.isPlaying_ = false;
        if (options && options.onEnded) {
          options.onEnded();
        }
      }.bind(this);

      if (this.playableBuffer.start) {
        this.playableBuffer.start(0);
      } else {
        (this.playableBuffer as any).noteOn(0);
      }
      this.handlePlayStarted(options);
      return;
    }

    if (!this.config.allowHTML5Mobile && isMobile()) {
      this.handlePlayFailed(options);
      return;
    }

    var volume =
      typeof options.volume === 'undefined'
        ? 1
        : Math.max(0, Math.min(1, options.volume));
    this.audioElement!.volume = volume;
    this.audioElement!.loop = !!options.loop;
    var unregisterAndCallback = function (this: Sound) {
      this.audioElement!.removeEventListener('abort', unregisterAndCallback);
      this.audioElement!.removeEventListener('ended', unregisterAndCallback);
      this.audioElement!.removeEventListener('pause', unregisterAndCallback);
      this.isPlaying_ = false;
      if (options && options.onEnded) {
        options.onEnded();
      }
    }.bind(this);
    this.audioElement!.addEventListener('abort', unregisterAndCallback);
    this.audioElement!.addEventListener('ended', unregisterAndCallback);
    this.audioElement!.addEventListener('pause', unregisterAndCallback);
    this.audioElement!.play();
    this.handlePlayStarted(options);
  }

  /**
   * Queue the sound to play as soon as it finishes loading.
   * No-ops if the sound is already loaded or playAfterLoad is already set.
   *
   * @param options - Playback options to use when the sound eventually plays.
   */
  playAfterLoad(options?: SoundOptions): void {
    if (this.isLoaded() || this.config.playAfterLoad) {
      this.handlePlayFailed(options || {});
      return;
    }
    this.config.playAfterLoad = true;
    this.config.playAfterLoadOptions = options;
  }

  /**
   * Invoke the failure callback, if any.
   *
   * @param options - Options object that may carry a callback.
   */
  handlePlayFailed(options: SoundOptions): void {
    if (options.callback) {
      options.callback(false);
    }
  }

  /**
   * Handle a load failure: set the failure flag and notify any waiting callers.
   *
   * @param status - HTTP status code, if available.
   */
  handleLoadFailed(status?: number): void {
    this.didLoadFail_ = true;
    const {onPreloadError, playAfterLoadOptions} = this.config;

    onPreloadError && onPreloadError(status);

    const callback = playAfterLoadOptions && playAfterLoadOptions.callback;
    callback && callback(false);
  }

  /**
   * Mark playback as started and invoke the success callback.
   *
   * @param options - Options object that may carry a callback.
   */
  handlePlayStarted(options: SoundOptions): void {
    this.isPlaying_ = true;
    if (options.callback) {
      options.callback(true);
    }
  }

  /** Stop the currently playing sound. */
  stop(): void {
    try {
      if (this.playableBuffer) {
        if (this.playableBuffer.stop) {
          this.playableBuffer.stop(0);
        } else if ((this.playableBuffer as any).noteOff) {
          (this.playableBuffer as any).noteOff(0);
        }
      } else if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    } catch (e: unknown) {
      if ((e as DOMException).name === 'InvalidStateError') {
        // Stopping a sound that hasn't been played.
      } else {
        throw e;
      }
    }
    this.isPlaying_ = false;
  }

  /** @returns Whether the sound is currently playing. */
  isPlaying(): boolean {
    return this.isPlaying_;
  }

  /** @returns Whether the sound has successfully loaded. */
  isLoaded(): boolean {
    return this.isLoaded_;
  }

  /** @returns Whether the sound failed to load. */
  didLoadFail(): boolean {
    return this.didLoadFail_;
  }

  /**
   * Create a new playable AudioBufferSourceNode from the given buffer.
   *
   * @param buffer - Decoded audio buffer to play.
   * @param options - Playback options including volume and loop.
   * @returns The new source node, or null if a gain node could not be created.
   */
  newPlayableBufferSource(
    buffer: AudioBuffer,
    options: SoundOptions,
  ): AudioBufferSourceNode | null {
    var newSound = this.audioContext!.createBufferSource();

    if ((this.audioContext as any).createGain) {
      this.gainNode = this.audioContext!.createGain();
    } else if ((this.audioContext as any).createGainNode) {
      this.gainNode = (this.audioContext as any).createGainNode();
    } else {
      return null;
    }

    newSound.buffer = buffer;
    newSound.loop = !!options.loop;
    newSound.connect(this.gainNode!);
    this.gainNode!.connect(this.audioContext!.destination);
    var startingVolume =
      typeof options.volume === 'undefined' ? 1 : options.volume;
    this.gainNode!.gain.value = startingVolume;
    return newSound;
  }

  /**
   * Do an exponential fade to a new gain value over the given duration.
   * Delegates to the Web Audio or HTML5 Audio implementation depending on
   * which player is active.
   *
   * @param gain - Desired final gain value.
   * @param durationSeconds - Duration of the fade in seconds.
   */
  fadeToGain(gain: number, durationSeconds: number): void {
    if (this.gainNode) {
      this.fadeToGainWebAudio_(gain, durationSeconds);
    } else if (this.audioElement) {
      this.fadeToGainHtml5Audio_(gain, durationSeconds);
    }
  }

  /**
   * Web Audio implementation of the gain fade.
   *
   * @param gain - Desired final gain value.
   * @param durationSeconds - Duration of the fade in seconds.
   * @private
   */
  private fadeToGainWebAudio_(gain: number, durationSeconds: number): void {
    if (!this.gainNode) {
      return;
    }

    if (gain === 0) {
      gain = 0.01;
    }

    var currTime = this.audioContext!.currentTime;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      gain,
      currTime + durationSeconds,
    );
  }

  /**
   * HTML5 Audio implementation of the gain fade using a setInterval poll.
   *
   * @param gain - Desired final gain value.
   * @param durationSeconds - Duration of the fade in seconds.
   * @private
   */
  private fadeToGainHtml5Audio_(gain: number, durationSeconds: number): void {
    if (!this.audioElement) {
      return;
    }

    var startVolume = this.audioElement.volume || 1;
    var finalVolume = Math.max(0, Math.min(1, gain));
    var deltaVolume = finalVolume - startVolume;
    var durationMillis = durationSeconds * 1000;
    var t0 = new Date().getTime();
    var fadeInterval = setInterval(
      function (this: Sound) {
        var t = new Date().getTime() - t0;

        if (t >= durationMillis) {
          this.audioElement!.volume = finalVolume;
          clearInterval(fadeInterval);
          return;
        }

        var newVolume =
          deltaVolume * Math.pow(t / durationMillis, 2) + startVolume;
        this.audioElement!.volume = Math.max(0, Math.min(1, newVolume));
      }.bind(this),
      100,
    );
  }

  /**
   * Determine the best playable audio file URL for the current browser.
   *
   * @returns The URL of the first supported audio file, or false if none.
   */
  getPlayableFile(): string | false {
    try {
      if (!window.Audio) {
        return false;
      }

      var audioTest = new window.Audio();

      if (
        this.config.hasOwnProperty('mp3') &&
        audioTest.canPlayType('audio/mp3')
      ) {
        return this.config.mp3!;
      }
      if (
        this.config.hasOwnProperty('ogg') &&
        audioTest.canPlayType('audio/ogg')
      ) {
        return this.config.ogg!;
      }
      if (
        this.config.hasOwnProperty('wav') &&
        audioTest.canPlayType('audio/wav')
      ) {
        return this.config.wav!;
      }
    } catch (e) {}

    return false;
  }

  /** Start loading the sound asset using the best available player. */
  preload(): void {
    var file = this.getPlayableFile();
    if (!file) {
      return;
    }

    if (!this.config.forceHTML5 && window.AudioContext && this.audioContext) {
      var self = this;
      this.preloadViaWebAudio(file, function (buffer) {
        self.reusableBuffer = buffer;
      });
      return;
    }

    if (window.Audio) {
      var audioElement = new window.Audio(file);
      if (!audioElement || !audioElement.play) {
        return;
      }

      if (!isIE9()) {
        audioElement.play();
        audioElement.pause();
      }
      this.audioElement = audioElement;

      var loadEventName = 'canplaythrough';
      var eventListener = function (this: Sound) {
        this.onSoundLoaded();
        audioElement.removeEventListener(loadEventName, eventListener);
      }.bind(this);
      audioElement.addEventListener(loadEventName, eventListener);
      audioElement.addEventListener('error', () => {
        this.handleLoadFailed();
      });
    }
  }

  /** Called when the sound asset is fully loaded and ready to play. */
  onSoundLoaded(): void {
    this.isLoaded_ = true;
    if (this.config.playAfterLoad) {
      this.play(this.config.playAfterLoadOptions);
    }
    if (this.onLoad) {
      this.onLoad();
    }
  }

  /**
   * Load a sound file via XMLHttpRequest and decode it using the Web Audio API.
   *
   * @param filename - URL of the audio file to fetch.
   * @param onPreloadedCallback - Called with the decoded AudioBuffer on success.
   */
  preloadViaWebAudio(
    filename: string,
    onPreloadedCallback: (buffer: AudioBuffer) => void,
  ): void {
    var request = new XMLHttpRequest();
    request.open('GET', filename, true);
    request.responseType = 'arraybuffer';
    var self = this;
    request.onload = function () {
      if (request.status === 200) {
        self.audioContext!.decodeAudioData(request.response, function (buffer) {
          onPreloadedCallback(buffer);
          self.onSoundLoaded();
        });
      } else {
        self.handleLoadFailed(request.status);
      }
    };
    request.onerror = function () {
      self.handleLoadFailed(request.status);
    };
    request.send();
  }
}
