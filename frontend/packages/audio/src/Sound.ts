// In the original codebase, this was represented by /apps/src/Sound.js

export interface PlaybackOptions {
  /**
   * The volume for playing back the sound. 1.0 is the default, which is
   * 'no change'.
   */
  volume?: number;
  /** Whether or not to loop the sound */
  loop?: boolean;
  /** A callback for playback status */
  callback?: (successful: boolean) => void;
  /** A callback for when the sound finishes playback */
  onEnded?: () => void;
  /** Forces the use of HTML5 audio elements for playback */
  forceHTML5?: boolean;
  /** Forces the use of mobile HTML5 audio capabilities for playback. */
  allowHTML5Mobile?: boolean;
  /** Suggests that we do not want to play the sound if it is already playing. */
  noOverlap?: boolean;
}

export const SoundExtensions = ['mp3', 'ogg', 'wav'] as const;

export type SoundExtensionsKey = (typeof SoundExtensions)[number];

type SoundPartialConfig = {
  /** The filename or path for the different supported extensions */
  [key in SoundExtensionsKey]?: string;
};

/** Represents a sound file in our sound registry. */
export interface SoundConfig extends SoundPartialConfig {
  /** The unique id of the registered sound */
  id: string;
  /** The byte data for the sound, if not a file. */
  bytes?: ArrayBuffer;
  /** Enforces that HTML5 audio elements be used by default to play the sound. */
  forceHTML5?: boolean;
  /**
   * Enforces that mobile HTML5 capabilities be used by default to play the
   * sound.
   */
  allowHTML5Mobile?: boolean;
  /** Suggests that the sound should play as soon as it loads. */
  playAfterLoad?: boolean;
  /** How the sound is played in the event playAfterLoad is true. */
  playAfterLoadOptions?: PlaybackOptions;
  /** A callback if preloading the sound fails */
  onPreloadError?: (status?: number) => void;
}

/**
 * Represents a loadable sound attached to an audio playing context.
 */
class Sound {
  /* The configuration for the sound, which lists the different formats */
  private config: SoundConfig;
  /* The audio context to use to play the sound when played */
  private audioContext?: AudioContext;
  /* For HTML5 audio */
  private audioElement: HTMLAudioElement | null = null;
  /* For Web audio */
  private reusableBuffer?: AudioBuffer;
  /* The Web audio gain node to manage volume */
  private gainNode?: GainNode;
  /* A set of buffers for playback */
  private playableBuffers: AudioBufferSourceNode[] = [];
  /* The number of playing buffers */
  private playingCount: number = 0;
  /* Keeps track of the playback status of the sound */
  private playing: boolean = false;
  /* Marked true when successfully loaded the sound data */
  private loaded: boolean = false;
  /* Marked true when the sound data fails to load */
  private loadFailed: boolean = false;
  /* Any callback to be triggered when the sound loads */
  private onLoadCallback?: () => void;

  static isMobile() {
    return 'ontouchstart' in document.documentElement;
  }

  /**
   * Initialize an individual sound
   * @param config - Available sound files for this audio
   * @param audioContext - context this sound can be played on, if any
   */
  constructor(config: SoundConfig, audioContext?: AudioContext) {
    // Retain the config and audio context, if given
    this.config = config;
    this.audioContext = audioContext;
  }

  /** Set the onLoad callback */
  set onLoad(value: () => void) {
    this.onLoadCallback = value;
  }

  /**
   * Plays the sound.
   * @param options - A set of options to determine playback properties.
   */
  play(options?: PlaybackOptions) {
    if (!this.audioElement && !this.reusableBuffer) {
      // We have no means to play sounds
      this.handlePlayFailed(options);
      return;
    }

    if (this.reusableBuffer) {
      // Using web audio, which is preferred
      const newBuffer = this.newPlayableAudioBufferSourceNode(
        this.reusableBuffer,
        options,
      );
      if (newBuffer) {
        const index = this.playableBuffers.push(newBuffer) - 1;

        // Hook up onEnded callback
        this.playableBuffers[index].onended = () => {
          this.playingCount = Math.max(this.playingCount - 1, 0);
          if (this.playingCount === 0) {
            this.playing = false;
            options?.onEnded?.();
          }
        };

        // Play sound
        this.playableBuffers[index].start(0);
        this.handlePlayStarted(options);
        return;
      }
    }

    if (!this.config.allowHTML5Mobile && Sound.isMobile()) {
      // Don't play HTML 5 audio on mobile
      this.handlePlayFailed(options);
      return;
    }

    // HTML5 fallback
    if (this.audioElement) {
      const volume =
        typeof options?.volume === 'undefined'
          ? 1
          : Math.max(0, Math.min(1, options?.volume));
      this.audioElement.volume = volume;
      this.audioElement.loop = !!options?.loop;
      const events = ['abort', 'ended', 'pause'];
      const unregisterAndCallback = () => {
        for (const eventName of events) {
          this.audioElement?.removeEventListener?.(
            eventName,
            unregisterAndCallback,
          );
        }
      };

      for (const eventName of events) {
        this.audioElement.addEventListener(eventName, unregisterAndCallback);
      }

      // Play the sound (HTML5)
      this.audioElement.play();
      this.handlePlayStarted(options);
      return;
    }

    // Could not play it
    this.handlePlayFailed(options);
  }

  playAfterLoad(options?: PlaybackOptions) {
    if (this.isLoaded() || this.config.playAfterLoad) {
      // If the sound is already loaded, or playAfterLoad has already been set
      // on this sound, then we must fail this play request.
      this.handlePlayFailed(options);
      return;
    }

    // Store the options and play the sound once the load has completed
    this.config.playAfterLoad = true;
    this.config.playAfterLoadOptions = options;
  }

  handlePlayFailed(options?: PlaybackOptions) {
    options?.callback?.(false);
  }

  handleLoadFailed(status?: number) {
    this.loadFailed = true;
    this.config.onPreloadError?.(status);
    this.config.playAfterLoadOptions?.callback?.(false);
  }

  handlePlayStarted(options?: PlaybackOptions) {
    this.playingCount++;
    this.playing = true;
    options?.callback?.(true);
  }

  /**
   * Stops playing the sound, if it is playing.
   */
  stop() {
    try {
      if (this.playableBuffers.length > 0) {
        for (const buffer of this.playableBuffers) {
          buffer.stop(0);
          this.playingCount = Math.max(this.playingCount - 1, 0);
        }
      } else if (this.audioElement) {
        // HTML5 Audio
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    } catch (err) {
      if (err instanceof Error && err.toString() === 'already registered') {
        // Stopping a sound that hasn't been played. Just ignore.
      } else {
        throw err;
      }
    }

    this.playing = false;
  }

  /**
   * Whether or not the sound is currently playing.
   */
  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Whether or not the sound data has loaded.
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Whether or not the sound data could not load.
   */
  didLoadFail(): boolean {
    return this.loadFailed;
  }

  private newPlayableAudioBufferSourceNode(
    buffer: AudioBuffer,
    options?: PlaybackOptions,
  ): AudioBufferSourceNode | null {
    if (!this.audioContext) {
      return null;
    }

    this.gainNode = this.audioContext.createGain();

    const newSound: AudioBufferSourceNode = new AudioBufferSourceNode(
      this.audioContext,
      {
        buffer,
        loop: !!options?.loop,
      },
    );

    newSound.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    const startingVolume =
      typeof options?.volume === 'undefined' ? 1 : options.volume;
    this.gainNode.gain.value = startingVolume;
    return newSound;
  }

  /**
   * Do an exponential fade from the current gain to a new given value, over the
   * given number of seconds.
   * @param gain - desired final gain value
   * @param durationSeconds - over this number of seconds
   */
  fadeToGain(gain: number, durationSeconds: number) {
    if (this.gainNode) {
      this.fadeToGainWebAudio(gain, durationSeconds);
    } else {
      this.fadeToGainHtml5Audio(gain, durationSeconds);
    }
  }

  /**
   * Do an exponential fade from the current gain to a new given value, over the
   * given number of seconds.
   * Using Web Audio (preferred, but not supported in IE)
   * @param gain - desired final gain value
   * @param durationSeconds - over this number of seconds
   */
  fadeToGainWebAudio(gain: number, durationSeconds: number) {
    if (!this.gainNode || !this.audioContext) {
      return;
    }

    // Can't exponential ramp to zero, simulate by getting close.
    if (gain === 0) {
      gain = 0.01;
    }

    const currentTime = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      gain,
      currentTime + durationSeconds,
    );
  }

  /**
   * Do an exponential fade from the current gain to a new given value, over the
   * given number of seconds.
   * Using HTML5 Audio (fallback player)
   * @param gain - desired final gain value
   * @param durationSeconds - over this number of seconds
   */
  private fadeToGainHtml5Audio(gain: number, durationSeconds: number) {
    if (!this.audioElement) {
      return;
    }

    const startVolume = this.audioElement.volume || 1;
    const finalVolume = Math.max(0, Math.min(1, gain));
    const deltaVolume = finalVolume - startVolume;
    const durationMillis = durationSeconds * 1000;
    const t0 = new Date().getTime();
    const fadeInterval = setInterval(() => {
      if (!this.audioElement) {
        return;
      }

      const t = new Date().getTime() - t0;

      // Base condition - after duration has elapsed, snap volume to final and
      // clear interval
      if (t >= durationMillis) {
        this.audioElement.volume = finalVolume;
        clearInterval(fadeInterval);
        return;
      }

      // Ease in quad - the ear hears this as a "linear" fade
      // y = c * (t/d)^2 + b
      //
      // Ease out quad - Reverse, for when deltaVolume is positive
      // y = c * (1 - (1 - t/d)^2) + b
      //
      //   b: initial value
      //   c: final delta
      //   d: duration
      //   t: time
      const newVolume =
        deltaVolume <= 0
          ? deltaVolume * Math.pow(t / durationMillis, 2) + startVolume
          : deltaVolume * (1 - Math.pow(1 - t / durationMillis, 2)) +
            startVolume;
      this.audioElement.volume = Math.max(0, Math.min(1, newVolume));
    }, 100);
  }

  /**
   * Returns the most preferred filename by usable and available file types.
   */
  getPlayableFile(): string | undefined {
    if (typeof window.Audio === 'undefined') {
      return;
    }

    const audioTest = new window.Audio();
    for (const type of SoundExtensions) {
      if (this.config[type] && audioTest.canPlayType(`audio/${type}`)) {
        return this.config[type];
      }
    }
  }

  /**
   * Returns the byte array if the environment we're in can play the data.
   */
  getPlayableBytes(): ArrayBuffer | undefined {
    if (typeof window.Audio === 'undefined') {
      return;
    }

    if (this.config.bytes === undefined) {
      return;
    }

    const audioTest = new window.Audio();
    if (audioTest.canPlayType('audio/mp3')) {
      return this.config.bytes;
    }
  }

  async preloadFile() {
    const file = this.getPlayableFile();
    if (!file) {
      return;
    }

    if (!this.config.forceHTML5 && this.audioContext) {
      const buffer = await this.preloadViaWebAudio(file);
      if (buffer) {
        this.reusableBuffer = buffer;
        this.onSoundLoaded();
        return;
      }
    }

    if (typeof window.Audio !== 'undefined') {
      const audioElement = new window.Audio(file);
      await this.preloadAudioElement(audioElement);
    }
  }

  async preloadBytes() {
    const bytes = this.getPlayableBytes();
    if (!bytes) {
      return;
    }

    if (!this.config.forceHTML5 && this.audioContext) {
      const buffer = await this.audioContext.decodeAudioData(bytes);
      this.reusableBuffer = buffer;
      this.onSoundLoaded();
      return;
    }

    if (typeof window.Audio !== 'undefined') {
      const blob = new Blob([bytes], {type: 'audio/mpeg3'});
      const url = window.URL.createObjectURL(blob);
      const audioElement = new window.Audio(url);
      await this.preloadAudioElement(audioElement);
    }
  }

  preloadAudioElement(audioElement: HTMLAudioElement) {
    if (!audioElement || !audioElement.play) {
      return;
    }

    // Pre-cache audio
    audioElement.play();
    audioElement.pause();
    this.audioElement = audioElement;

    // Fire onLoad as soon as enough of the sound is loaded to play it
    // all the way through.
    const loadEventName = 'canplaythrough';
    const eventListener = () => {
      this.onSoundLoaded();
      audioElement.removeEventListener(loadEventName, eventListener);
    };
    audioElement.addEventListener(loadEventName, eventListener);
    audioElement.addEventListener('error', () => {
      // Indicate failure without the http status code since it is not
      // available in this context.
      this.handleLoadFailed();
    });
  }

  onSoundLoaded() {
    this.loaded = true;
    if (this.config.playAfterLoad) {
      this.play(this.config.playAfterLoadOptions);
    }
    this.onLoadCallback?.();
  }

  async preloadViaWebAudio(filename: string): Promise<AudioBuffer | undefined> {
    if (!this.audioContext) {
      return;
    }

    try {
      const response = await fetch(filename);

      if (!response.ok) {
        this.handleLoadFailed(response.status);
        return;
      }

      const arraybuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arraybuffer);
    } catch {
      this.handleLoadFailed(500);
      return;
    }
  }
}

export default Sound;
