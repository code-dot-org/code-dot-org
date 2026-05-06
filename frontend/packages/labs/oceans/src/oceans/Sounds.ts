/* eslint-disable */

/* global AudioContext */
import Sound from './Sound';
import type {SoundConfig, SoundOptions} from './Sound';

/**
 * Simple registry for cross-browser sound effect playback.
 * Plays sounds using Web Audio or HTML5 Audio where available.
 *
 * Based on blockly-core's sound loading in blockly-core/core/blockly.js
 *
 * Usage:
 *   var mySounds = new Sounds();
 *   mySounds.register({id: 'myFirstSound', ogg: '/mysound.ogg', mp3: '/mysound.mp3'});
 *   mySounds.play('myFirstSound');
 */
export default class Sounds {
  audioContext: AudioContext | null;
  isMuted: boolean;
  soundsById: Record<string, Sound>;

  /** @private Whether the audio system has been unlocked by user interaction. */
  private audioUnlocked_: boolean;

  /** @private Callbacks to fire once audio is unlocked. */
  private whenAudioUnlockedCallbacks_: Array<() => void>;

  constructor() {
    (window as any).AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;

    this.audioContext = null;
    this.isMuted = false;
    this.audioUnlocked_ = false;

    if (window.AudioContext) {
      try {
        this.audioContext = new AudioContext();
        this.initializeAudioUnlockState_();
      } catch (e) {
        /**
         * Chrome occasionally chokes on creating singleton AudioContext
         * instances in separate tabs when iframes are open.
         * Falls back to window.Audio.
         */
      }
    }

    this.soundsById = {};
    this.whenAudioUnlockedCallbacks_ = [];
  }

  /** @returns The shared singleton Sounds instance. */
  static getSingleton(): Sounds {
    if (!singleton) {
      singleton = new Sounds();
    }
    return singleton;
  }

  /**
   * Play a silent clip to check/trigger audio unlock.
   * On mobile, the initial attempt usually fails; this attaches event listeners
   * to retry on first user interaction.
   * @private
   */
  private initializeAudioUnlockState_(): void {
    this.unlockAudio(
      function (this: Sounds) {
        if (this.isAudioUnlocked()) {
          return;
        }
        var unlockHandler = function (this: Sounds) {
          this.unlockAudio(
            function (this: Sounds) {
              if (this.isAudioUnlocked()) {
                document.removeEventListener('mousedown', unlockHandler, true);
                document.removeEventListener('touchend', unlockHandler, true);
                document.removeEventListener('keydown', unlockHandler, true);
              }
            }.bind(this),
          );
        }.bind(this);
        document.addEventListener('mousedown', unlockHandler, true);
        document.addEventListener('touchend', unlockHandler, true);
        document.addEventListener('keydown', unlockHandler, true);
      }.bind(this),
    );
  }

  /**
   * @returns Whether the audio system is currently unlocked.
   */
  isAudioUnlocked(): boolean {
    return this.audioUnlocked_ || !this.audioContext;
  }

  /**
   * Invoke callback immediately if audio is unlocked; otherwise queue it.
   *
   * @param callback - Function to call once audio is unlocked.
   */
  whenAudioUnlocked(callback: () => void): void {
    if (this.isAudioUnlocked()) {
      callback();
    } else {
      this.whenAudioUnlockedCallbacks_.push(callback);
    }
  }

  /**
   * Play a brief silent clip to test whether audio is usable in the current
   * browser context, and/or trigger an unlock when called from user interaction.
   *
   * @param onComplete - Called after the unlock attempt completes.
   */
  unlockAudio(onComplete?: () => void): void {
    if (this.isAudioUnlocked()) {
      return;
    }

    var buffer = this.audioContext!.createBuffer(1, 1, 22050);
    var source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);
    if (source.start) {
      source.start(0);
    } else {
      (source as any).noteOn(0);
    }

    this.checkDidSourcePlay_(
      source,
      this.audioContext!,
      function (this: Sounds, didPlay: boolean) {
        if (didPlay) {
          this.audioUnlocked_ = true;
          this.whenAudioUnlockedCallbacks_.forEach(function (cb) {
            cb();
          });
          this.whenAudioUnlockedCallbacks_.length = 0;
        }

        if (onComplete) {
          onComplete();
        }
      }.bind(this),
    );
  }

  /**
   * Asynchronously check whether the given source node produced audio output.
   *
   * @param source - The AudioBufferSourceNode that was played.
   * @param context - The AudioContext the source was played on.
   * @param onComplete - Called with true if audio played, false otherwise.
   * @private
   */
  private checkDidSourcePlay_(
    source: AudioBufferSourceNode,
    context: AudioContext,
    onComplete: (didPlay: boolean) => void,
  ): void {
    if (
      (source as any).PLAYING_STATE !== undefined &&
      (source as any).FINISHED_STATE !== undefined
    ) {
      setTimeout(
        function (this: Sounds) {
          onComplete(
            (source as any).playbackState === (source as any).PLAYING_STATE ||
              (source as any).playbackState === (source as any).FINISHED_STATE,
          );
        }.bind(this),
        0,
      );
      return;
    }

    setTimeout(
      function (this: Sounds) {
        onComplete(
          'number' === typeof context.currentTime && context.currentTime > 0,
        );
      }.bind(this),
      50,
    );
  }

  /**
   * Register a sound from a list of URL paths, inferring file types from extensions.
   *
   * @param soundPaths - Array of audio file URLs ending in their file extension.
   * @param soundID - ID to register the sound under.
   * @returns The registered Sound instance.
   */
  registerByFilenamesAndID(soundPaths: string[], soundID: string): Sound {
    var soundRegistrationConfig: SoundConfig & Record<string, unknown> = {
      id: soundID,
    };
    for (var i = 0; i < soundPaths.length; i++) {
      var soundFilePath = soundPaths[i];
      var getExtensionRegexp = /\.(\w+)(\?.*)?$/;
      var extensionCaptureGroups = soundFilePath.match(getExtensionRegexp);
      if (extensionCaptureGroups) {
        var extension = extensionCaptureGroups[1];
        soundRegistrationConfig[extension] = soundFilePath;
      }
    }
    return this.register(soundRegistrationConfig as SoundConfig);
  }

  /**
   * Register a sound from a config object and begin preloading it.
   *
   * @param config - Sound configuration including id and file paths.
   * @returns The registered Sound instance.
   */
  register(config: SoundConfig): Sound {
    var sound = new Sound(config, this.audioContext);
    this.soundsById[config.id!] = sound;
    sound.preload();
    return sound;
  }

  /**
   * Play a previously registered sound.
   *
   * @param soundId - ID of the sound to play.
   * @param options - Optional playback parameters.
   */
  play(soundId: string, options?: SoundOptions): void {
    var sound = this.soundsById[soundId];
    if (sound) {
      sound.play(options);
    }
  }

  /**
   * Release a sound from the registry so it can be garbage collected.
   *
   * @param soundId - ID of the sound to unload.
   */
  unload(soundId: string): void {
    delete this.soundsById[soundId];
  }

  /**
   * Play a sound identified by URL, registering and preloading it on first call.
   *
   * @param url - URL of the audio file to play.
   * @param playbackOptions - Optional playback parameters.
   */
  playURL(url: string, playbackOptions?: SoundOptions): void {
    if (this.isMuted) {
      return;
    }
    var sound = this.soundsById[url];
    if (sound && !sound.didLoadFail()) {
      if (sound.isLoaded()) {
        sound.play(playbackOptions);
      } else {
        sound.playAfterLoad(playbackOptions);
      }
    } else {
      var soundConfig: SoundConfig & Record<string, unknown> = {id: url};
      var ext = Sounds.getExtensionFromUrl(url);
      soundConfig[ext] = url;
      soundConfig.forceHTML5 = playbackOptions && playbackOptions.forceHTML5;
      soundConfig.allowHTML5Mobile =
        playbackOptions && playbackOptions.allowHTML5Mobile;
      soundConfig.playAfterLoad = true;
      soundConfig.playAfterLoadOptions = playbackOptions;
      this.register(soundConfig as SoundConfig);
    }
  }

  /**
   * @param url - URL of the sound to query.
   * @returns Whether the given sound URL is currently playing.
   */
  isPlayingURL(url: string): boolean {
    var sound = this.soundsById[url];
    if (sound) {
      return sound.isPlaying();
    }
    return false;
  }

  /**
   * Stop playing the sound registered under the given URL.
   *
   * @param url - URL of the sound to stop.
   */
  stopPlayingURL(url: string): void {
    var sound = this.soundsById[url];
    if (sound) {
      sound.stop();
    }
  }

  /** Mute all subsequent playURL() calls. */
  muteURLs(): void {
    this.isMuted = true;
  }

  /** Re-enable playURL() calls after a previous muteURLs(). */
  unmuteURLs(): void {
    this.isMuted = false;
  }

  /** Stop all currently playing sounds. */
  stopAllAudio(): void {
    for (let soundId in this.soundsById) {
      if (this.soundsById[soundId].isPlaying()) {
        this.soundsById[soundId].stop();
      }
    }
  }

  /**
   * Stop the looping sound registered under the given ID.
   *
   * @param soundId - ID of the looping sound to stop.
   */
  stopLoopingAudio(soundId: string): void {
    var sound = this.soundsById[soundId];
    sound.stop();
  }

  /**
   * Retrieve a registered Sound by ID.
   *
   * @param soundId - ID of the sound to retrieve.
   * @returns The Sound instance, or undefined if not found.
   */
  get(soundId: string): Sound | undefined {
    return this.soundsById[soundId];
  }

  /**
   * Extract the file extension from a URL string.
   *
   * @param url - Audio file URL.
   * @returns The extension portion (e.g. 'mp3', 'ogg').
   */
  static getExtensionFromUrl(url: string): string {
    return url.substr(url.lastIndexOf('.') + 1);
  }
}

/** Module-level singleton instance. */
let singleton: Sounds | undefined;
