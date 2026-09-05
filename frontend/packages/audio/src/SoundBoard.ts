// In the original codebase, this was represented by /apps/src/Sounds.js

import type {SoundConfig, PlaybackOptions} from './Sound';
import Sound, {SoundExtensions} from './Sound';

/**
 * Represents the audio context and sound management.
 */
class SoundBoard {
  /** The web audio context */
  private audioContext?: AudioContext;
  /** Whether or not the browser is permitting audio playback */
  private audioUnlocked: boolean = false;
  /** Pending callbacks to be triggered when audio is permitted to play */
  private whenAudioUnlockedCallbacks: (() => void)[] = [];
  /** Callbacks for after audio is stopped */
  private onStopAllAudioCallbacks: (() => void)[] = [];
  /** Holds a registry of sounds by their unique ids. */
  private soundsById: {
    [key: string]: Sound;
  };
  /** Whether or not to play via playUrl */
  private muted: boolean = false;
  /** The ids of paused sounds */
  private pausedSounds: string[] = [];

  /**
   * Creates an instance of an audio manager.
   */
  constructor() {
    // Create an audio context
    const AudioContext = window.AudioContext;

    // Clear sound registry
    this.soundsById = {};

    if (AudioContext) {
      try {
        this.audioContext = new AudioContext();
        this.initializeAudioUnlockState();
      } catch {
        /**
         * Chrome occasionally chokes on creating singleton AudioContext instances in separate tabs
         * when iframes are open, potentially related to:
         *    https://code.google.com/p/chromium/issues/detail?id=308784
         * or https://code.google.com/p/chromium/issues/detail?id=160022
         *
         * In the Chrome case, this will fall-back to the `window.Audio` method
         */
      }
    }
  }

  /**
   * Remove references to the specified sound so that it can be garbage collected
   * to free up memory.
   * @param id - Sound id to unload. This is the URL for sounds played via playURL.
   */
  unload(id: string) {
    delete this.soundsById[id];
  }

  /**
   * Plays the given registered sound.
   */
  play(id: string, options?: PlaybackOptions) {
    // Satisfy the noOverlap option
    if (options?.noOverlap && this.isPlaying(id)) {
      return;
    }

    const sound: Sound | undefined = this.soundsById[id];
    sound?.play(options);
  }

  /**
   * Play the sound from the given URL.
   *
   * Will register the sound using the URL as the sound id if it has not been
   * seen before. It will then reuse the registered and loaded sound if called
   * again. Use `unload` to deregister the played URL audio.
   */
  playUrl(url: string, playbackOptions?: PlaybackOptions) {
    if (this.muted) {
      return;
    }

    const sound: Sound | undefined = this.soundsById[url];
    if (sound && !sound.didLoadFail()) {
      if (sound.isLoaded()) {
        sound.play(playbackOptions);
      } else {
        sound.playAfterLoad(playbackOptions);
      }
    } else {
      const soundConfig: SoundConfig = {
        id: url,
      };
      const ext = url.substr(url.lastIndexOf('.') + 1);
      if (SoundExtensions.find(item => item === ext)) {
        soundConfig[ext as (typeof SoundExtensions)[number]] = url;
        // Force HTML5 audio if the caller requests it (cross-domain origin issues)
        soundConfig.forceHTML5 = playbackOptions?.forceHTML5;
        // Force HTML5 audio on mobile if the caller requests it
        soundConfig.allowHTML5Mobile = playbackOptions?.allowHTML5Mobile;
        // since preload may be async, we set playAfterLoad in the config so we
        // play the sound once it is loaded
        // Also stick the playbackOptions inside the config as playAfterLoadOptions
        soundConfig.playAfterLoad = true;
        soundConfig.playAfterLoadOptions = playbackOptions;
        this.register(soundConfig);
      }
    }
  }

  playBytes(id: string, bytes: ArrayBuffer, playbackOptions?: PlaybackOptions) {
    if (this.muted) {
      return;
    }

    const soundConfig: SoundConfig = {
      id,
      bytes,
      playAfterLoad: true,
      playAfterLoadOptions: playbackOptions,
      forceHTML5: playbackOptions?.forceHTML5,
      allowHTML5Mobile: playbackOptions?.allowHTML5Mobile,
    };

    const sound = this.register(soundConfig);
    sound.preloadBytes();
    sound.play();
  }

  /**
   * Whether or not the sound using the given id (or URL) is currently playing.
   * @param id - The id (or URL via playURL) of the sound to check.
   */
  isPlaying(id: string): boolean {
    const sound: Sound | undefined = this.soundsById[id];
    return !!sound?.isPlaying();
  }

  /**
   * Stops playing the given sound by id.
   */
  stop(id: string) {
    const sound: Sound | undefined = this.soundsById[id];
    sound?.stop();
  }

  /**
   * Stops playing the sound using the URL as an id, as via playUrl.
   */
  stopPlayingUrl(url: string) {
    // URLs are just ids, so just pass it to the stop method.
    this.stop(url);
  }

  /**
   * While muted, playURL() has no effect.
   */
  muteURLs() {
    this.muted = true;
  }

  /**
   * Reverses the muteURLs call to ensure playURL() takes effect.
   */
  unmuteURLs() {
    this.muted = false;
  }

  /**
   * Pause all currently playing sounds, and keep track of the paused sounds so
   * they can be restarted later.
   */
  pauseSounds() {
    this.pausedSounds = Object.keys(this.soundsById).filter(
      soundUrl => this.soundsById[soundUrl].isPlaying,
    );
    this.pausedSounds.forEach(soundUrl => this.stopPlayingUrl(soundUrl));
  }

  /**
   * Play all paused sounds and clear out the paused sounds list.
   */
  restartPausedSounds() {
    this.pausedSounds.forEach(soundUrl => this.playUrl(soundUrl));
    this.pausedSounds = [];
  }

  /**
   * Stop all playing sounds immediately.
   */
  stopAllAudio() {
    Object.values(this.soundsById).forEach(sound => sound.stop());
    this.onStopAllAudioCallbacks.forEach(callback => callback());
  }

  /**
   * Register a callback that will be invoked when all audio is stopped.
   * @param callback - A callback to be called when the audio is stopped.
   */
  onStopAllAudio(callback: () => void) {
    this.onStopAllAudioCallbacks.push(callback);
  }

  /**
   * Stops the given sound.
   */
  stopLoopingAudio(id: string) {
    const sound: Sound | undefined = this.soundsById[id];
    sound?.stop();
  }

  /**
   * Retrieves the already registered Sound by its id (or url).
   * @param id - ID for sound
   * @returns The registered sound or undefined if not known.
   */
  get(id: string): Sound | undefined {
    return this.soundsById[id];
  }

  /**
   * Registers the given sound defined by the given configuration.
   *
   * You can then refer to the sound via the `id` given by that configuration.
   *
   * If there is already a sound registered with the given id, the existing one
   * will be returned. One must `unload` the sound first to reinitialize it.
   *
   * @param config - The description of the sound.
   */
  register(config: SoundConfig): Sound {
    if (config.id in this.soundsById) {
      return this.soundsById[config.id];
    }

    const sound = new Sound(config, this.audioContext);
    this.soundsById[config.id] = sound;
    sound.preloadFile();
    return sound;
  }

  /**
   * Registers a sound from a list of sound URL paths.
   * Note: you can only register one sound resource per file type
   * @param soundPaths - list of sound file URLs ending in their
   *                                   file format (.mp3|.ogg|.wav)
   * @param id - ID for sound
   */
  registerByFilenamesAndId(soundPaths: string[], id: string): Sound {
    const soundRegistrationConfig: SoundConfig = {id};
    for (const soundFilePath of soundPaths) {
      const groups = soundFilePath.match(/\.(\w+)(\?.*)?$/);
      if (groups) {
        const extension: string = groups[1];
        if (SoundExtensions.find(item => item === extension)) {
          soundRegistrationConfig[
            extension as (typeof SoundExtensions)[number]
          ] = soundFilePath;
        }
      }
    }

    return this.register(soundRegistrationConfig);
  }

  /**
   * Whether or not the browser is allowing us to play audio.
   */
  isAudioUnlocked(): boolean {
    return this.audioUnlocked || !this.audioContext;
  }

  /**
   * Ensure that a callback occurs with the audio system unlocked.
   * If the audio system is already unlocked, the callback will occur immediately.
   * Otherwise it will occur after audio is successfully unlocked.
   */
  whenAudioUnlocked(callback: () => void) {
    if (this.isAudioUnlocked()) {
      callback();
    } else {
      this.whenAudioUnlockedCallbacks.push(callback);
    }
  }

  /**
   * Plays a silent sound to check whether audio is unlocked (usable) in the
   * current browser.
   * On mobile, our initial audio unlock will fail because unlocking audio
   * requires user interaction.  In that case, we add a handler to catch
   * the first user interaction and try unlocking audio again.
   */
  private async initializeAudioUnlockState() {
    await this.unlockAudio();

    if (this.isAudioUnlocked()) {
      return;
    }

    // We look to see if audio is allowed after the next UI interaction
    const events = ['mousedown', 'touchend', 'keydown'];
    const unlockHandler = async () => {
      await this.unlockAudio();

      if (this.isAudioUnlocked()) {
        for (const eventName of events) {
          window.document.removeEventListener(eventName, unlockHandler, true);
        }
      }
    };

    for (const eventName of events) {
      window.document.addEventListener(eventName, unlockHandler, true);
    }
  }

  /**
   * Mobile browsers disable audio until a sound is triggered by user interaction.
   * This method tries to play a brief silent clip to test whether audio is
   * unlocked, and/or trigger an unlock if called inside a user interaction.
   *
   * Special thanks to this article for the general approach:
   * https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
   */
  private async unlockAudio() {
    if (this.isAudioUnlocked() || !this.audioContext) {
      return;
    }

    // create empty buffer and play it
    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    const didPlay = await SoundBoard.checkDidSourcePlay(
      source,
      this.audioContext,
    );
    if (didPlay) {
      this.audioUnlocked = true;
      this.whenAudioUnlockedCallbacks.forEach(cb => cb());
      this.whenAudioUnlockedCallbacks = [];
    }
  }

  /**
   * Performs an asynchronous check for whether the given source and context
   * actually played audio.  When finished, calls provided callback passing
   * success/failure as a boolean argument.
   */
  private static async checkDidSourcePlay(
    source: AudioBufferSourceNode,
    context: AudioContext,
  ) {
    return new Promise<boolean>(resolve => {
      // Approach 1: Although AudioBufferSourceNode.playbackState is supposedly
      //             deprecated, it's still the most reliable way to check whether
      //             playback occurred on iOS devices through iOS9, and requires
      //             only a 0ms timeout to work.
      //             We feature-check this approach by seeing if the related enums
      //             exist first.
      const legacySource = source as {
        PLAYING_STATE?: string;
        FINISHED_STATE?: string;
        playbackState?: string;
      };
      if (
        legacySource.PLAYING_STATE !== undefined &&
        legacySource.FINISHED_STATE !== undefined
      ) {
        window.setTimeout(
          () =>
            resolve(
              legacySource.playbackState === legacySource.PLAYING_STATE ||
                legacySource.playbackState === legacySource.FINISHED_STATE,
            ),
          0,
        );
      }

      // Approach 2: Platforms that have removed playbackState can be checked most
      //             reliably with a longer delay and a check against the
      //             AudioContext.currentTime, which should be greater than the
      //             time passed to source.start() (in this case, zero).
      setTimeout(
        () =>
          resolve(
            'number' === typeof context.currentTime && context.currentTime > 0,
          ),
        50,
      );
    });
  }
}

export default SoundBoard;
