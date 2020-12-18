/* global AudioContext */
import Sound from './Sound';
import _ from 'lodash';

/**
 * Interface for a sound registry and playback mechanism
 * @interface AudioPlayer
 */

/**
 * Register a sound to a given ID
 *
 * @function
 * @name AudioPlayer#register
 * @param {Object} options
 * @param {string} options.id the sound ID for playback
 * @param {string} [options.mp3] path to mp3 file
 * @param {string} [options.ogg] path to ogg file
 * @param {string} [options.wav] path to wav file
 */

/**
 * Attempt to play back a sound with a given ID (if exists)
 *
 * @function
 * @name AudioPlayer#play
 * @param {string} soundId - Name of the sound to play
 * @param {Object} [options]
 * @param {number} [options.volume] default 1.0, which is "no change"
 * @param {boolean} [options.loop] default false
 * @param {function} [options.onEnded]
 */

/**
 * Simple registry for cross-browser sound effect playback.
 * Will play sounds using Web Audio or HTML5 Audio element where available.
 *
 * Based off of blockly-core's sound loading in blockly-core/core/blockly.js
 *
 * Usage:
 *   var mySounds = new Sounds();
 *   mySounds.register({id: 'myFirstSound', ogg: '/mysound.ogg', mp3: '/mysound.mp3'});
 *   mySounds.play('myFirstSound');
 * @constructor
 * @implements AudioPlayer
 */

export default function Sounds() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  this.audioContext = null;

  this.isMuted = false;

  /**
   * Detect whether audio system is "unlocked" - it usually works immediately
   * on dekstop, but mobile usually restricts audio until triggered by user.
   * @private {boolean}
   */
  this.audioUnlocked_ = false;

  if (window.AudioContext) {
    try {
      this.audioContext = new AudioContext();
      this.initializeAudioUnlockState_();
    } catch (e) {
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

  this.soundsById = {};

  /** @private {function[]} */
  this.whenAudioUnlockedCallbacks_ = [];

  /**
   * Callbacks invoked when all audio is stopped (e.g., Sounds.stopAllAudio is invoked).
   * @private {function[]}
   */
  this.onStopAllAudioCallbacks_ = [];
}

let singleton;
Sounds.getSingleton = function() {
  if (!singleton) {
    singleton = new Sounds();
  }
  return singleton;
};

/**
 * Plays a silent sound to check whether audio is unlocked (usable) in the
 * current browser.
 * On mobile, our initial audio unlock will fail because unlocking audio
 * requires user interaction.  In that case, we add a handler to catch
 * the first user interaction and try unlocking audio again.
 * @private
 */
Sounds.prototype.initializeAudioUnlockState_ = function() {
  this.unlockAudio(
    function() {
      if (this.isAudioUnlocked()) {
        return;
      }
      var unlockHandler = function() {
        this.unlockAudio(
          function() {
            if (this.isAudioUnlocked()) {
              document.removeEventListener('mousedown', unlockHandler, true);
              document.removeEventListener('touchend', unlockHandler, true);
              document.removeEventListener('keydown', unlockHandler, true);
            }
          }.bind(this)
        );
      }.bind(this);
      document.addEventListener('mousedown', unlockHandler, true);
      document.addEventListener('touchend', unlockHandler, true);
      document.addEventListener('keydown', unlockHandler, true);
    }.bind(this)
  );
};

/**
 * Whether we're allowed to play audio by the browser yet.
 * @returns {boolean}
 */
Sounds.prototype.isAudioUnlocked = function() {
  // Audio unlock doesn't make sense for the fallback player as used here.
  return this.audioUnlocked_ || !this.audioContext;
};

/**
 * Ensure that a callback occurs with the audio system unlocked.
 * If the audio system is already unlocked, the callback will occur immediately.
 * Otherwise it will occur after audio is successfully unlocked.
 * @param {function} callback
 */
Sounds.prototype.whenAudioUnlocked = function(callback) {
  if (this.isAudioUnlocked()) {
    callback();
  } else {
    this.whenAudioUnlockedCallbacks_.push(callback);
  }
};

/**
 * Mobile browsers disable audio until a sound is triggered by user interaction.
 * This method tries to play a brief silent clip to test whether audio is
 * unlocked, and/or trigger an unlock if called inside a user interaction.
 *
 * Special thanks to this article for the general approach:
 * https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
 *
 * @param {function} [onComplete] callback for after we've checked whether
 *        audio was unlocked successfully.
 */
Sounds.prototype.unlockAudio = function(onComplete) {
  if (this.isAudioUnlocked()) {
    return;
  }

  // create empty buffer and play it
  var buffer = this.audioContext.createBuffer(1, 1, 22050);
  var source = this.audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(this.audioContext.destination);
  if (source.start) {
    source.start(0);
  } else {
    source.noteOn(0);
  }

  this.checkDidSourcePlay_(
    source,
    this.audioContext,
    function(didPlay) {
      if (didPlay) {
        this.audioUnlocked_ = true;
        this.whenAudioUnlockedCallbacks_.forEach(function(cb) {
          cb();
        });
        this.whenAudioUnlockedCallbacks_.length = 0;
      }

      if (onComplete) {
        onComplete();
      }
    }.bind(this)
  );
};

/**
 * Performs an asynchronous check for whether the given source and context
 * actually played audio.  When finished, calls provided callback passing
 * success/failure as a boolean argument.
 * @param {!AudioBufferSourceNode} source
 * @param {!AudioContext} context
 * @param {!function(boolean)} onComplete
 * @private
 */
Sounds.prototype.checkDidSourcePlay_ = function(source, context, onComplete) {
  // Approach 1: Although AudioBufferSourceNode.playbackState is supposedly
  //             deprecated, it's still the most reliable way to check whether
  //             playback occurred on iOS devices through iOS9, and requires
  //             only a 0ms timeout to work.
  //             We feature-check this approach by seeing if the related enums
  //             exist first.
  if (
    source.PLAYING_STATE !== undefined &&
    source.FINISHED_STATE !== undefined
  ) {
    setTimeout(
      function() {
        onComplete(
          source.playbackState === source.PLAYING_STATE ||
            source.playbackState === source.FINISHED_STATE
        );
      }.bind(this),
      0
    );
    return;
  }

  // Approach 2: Platforms that have removed playbackState can be checked most
  //             reliably with a longer delay and a check against the
  //             AudioContext.currentTime, which should be greater than the
  //             time passed to source.start() (in this case, zero).
  setTimeout(
    function() {
      onComplete(
        'number' === typeof context.currentTime && context.currentTime > 0
      );
    }.bind(this),
    50
  );
};

/**
 * Registers a sound from a list of sound URL paths.
 * Note: you can only register one sound resource per file type
 * @param {Array.<string>} soundPaths list of sound file URLs ending in their
 *                                   file format (.mp3|.ogg|.wav)
 * @param {string} soundID ID for sound
 * @returns {Sound}
 */
Sounds.prototype.registerByFilenamesAndID = function(soundPaths, soundID) {
  var soundRegistrationConfig = {id: soundID};
  for (var i = 0; i < soundPaths.length; i++) {
    var soundFilePath = soundPaths[i];
    var getExtensionRegexp = /\.(\w+)(\?.*)?$/;
    var extensionCaptureGroups = soundFilePath.match(getExtensionRegexp);
    if (extensionCaptureGroups) {
      // Extend soundRegistrationConfig with format options
      // so e.g. soundRegistrationConfig['mp3'] = 'file.mp3'
      var extension = extensionCaptureGroups[1];
      soundRegistrationConfig[extension] = soundFilePath;
    }
  }
  return this.register(soundRegistrationConfig);
};

/**
 * @param {Object} config
 * @returns {Sound}
 */
Sounds.prototype.register = function(config) {
  var sound = new Sound(config, this.audioContext);
  this.soundsById[config.id] = sound;
  sound.preloadFile();
  return sound;
};

/**
 * @param {string} soundId - Name of the sound to play
 * @param {Object} [options]
 * @param {number} [options.volume] default 1.0, which is "no change"
 * @param {boolean} [options.loop] default false
 * @param {function} [options.onEnded]
 */
Sounds.prototype.play = function(soundId, options) {
  var sound = this.soundsById[soundId];
  if (sound) {
    sound.play(options);
  }
};

/**
 * Remove references to the specified sound so that it can be garbage collected
 * to free up memory.
 * @param soundId {string} Sound id to unload. This is the URL for sounds
 * played via playURL.
 */
Sounds.prototype.unload = function(soundId) {
  delete this.soundsById[soundId];
};

Sounds.prototype.playURL = function(url, playbackOptions) {
  if (this.isMuted) {
    return;
  }
  // Play a sound given a URL, register it using the URL as id and infer
  // the file type from the extension at the end of the URL
  // (NOTE: not ideal because preload happens inside first play)
  var sound = this.soundsById[url];
  // If the song previously failed to load, let the call to this.register()
  // below replace its entry in this.soundsById and try again to load it.
  if (sound && !sound.didLoadFail()) {
    if (sound.isLoaded()) {
      sound.play(playbackOptions);
    } else {
      sound.playAfterLoad(playbackOptions);
    }
  } else {
    var soundConfig = {id: url};
    var ext = Sounds.getExtensionFromUrl(url);
    soundConfig[ext] = url;
    // Force HTML5 audio if the caller requests it (cross-domain origin issues)
    soundConfig.forceHTML5 = playbackOptions && playbackOptions.forceHTML5;
    // Force HTML5 audio on mobile if the caller requests it
    soundConfig.allowHTML5Mobile =
      playbackOptions && playbackOptions.allowHTML5Mobile;
    // since preload may be async, we set playAfterLoad in the config so we
    // play the sound once it is loaded
    // Also stick the playbackOptions inside the config as playAfterLoadOptions
    soundConfig.playAfterLoad = true;
    soundConfig.playAfterLoadOptions = playbackOptions;
    this.register(soundConfig);
  }
};

/**
 * @param {string} id of the sound.
 * @param {ArrayBuffer} bytes of the sound to play.
 * @param {object} playbackOptions config for the playing of the sound.
 */
Sounds.prototype.playBytes = function(id, bytes, playbackOptions) {
  if (this.isMuted) {
    return;
  }
  let soundConfig = {};
  soundConfig.forceHTML5 = playbackOptions && playbackOptions.forceHTML5;
  soundConfig.allowHTML5Mobile =
    playbackOptions && playbackOptions.allowHTML5Mobile;
  soundConfig.playAfterLoad = true;
  soundConfig.playAfterLoadOptions = playbackOptions;
  soundConfig.bytes = bytes;
  let sound = new Sound(soundConfig, this.audioContext);
  this.soundsById[id] = sound;
  sound.preloadBytes();
  sound.play();
};

/**
 * @param {!string} id of the sound. This is a URL for sounds played via playURL.
 * @returns {boolean} whether the given sound is currently playing.
 */
Sounds.prototype.isPlaying = function(id) {
  var sound = this.soundsById[id];
  if (sound) {
    return sound.isPlaying();
  }
  return false;
};

/**
 * Stop playing url.
 */
Sounds.prototype.stopPlayingURL = function(url) {
  var sound = this.soundsById[url];
  if (sound) {
    sound.stop();
  }
};

/**
 * While muted, playURL() has no effect.
 */
Sounds.prototype.muteURLs = function() {
  this.isMuted = true;
};

Sounds.prototype.unmuteURLs = function() {
  this.isMuted = false;
};

/**
 * Stop all playing sounds immediately.
 */
Sounds.prototype.stopAllAudio = function() {
  for (let soundId in this.soundsById) {
    if (this.soundsById[soundId].isPlaying()) {
      this.soundsById[soundId].stop();
    }
  }

  _.over(this.onStopAllAudioCallbacks_)();
};

/**
 * Register a callback that will be invoked when all audio is stopped.
 * @param {function} callback with no arguments.
 */
Sounds.prototype.onStopAllAudio = function(callback) {
  this.onStopAllAudioCallbacks_.push(callback);
};

Sounds.prototype.stopLoopingAudio = function(soundId) {
  var sound = this.soundsById[soundId];
  sound.stop();
};

Sounds.prototype.get = function(soundId) {
  return this.soundsById[soundId];
};

Sounds.getExtensionFromUrl = function(url) {
  return url.substr(url.lastIndexOf('.') + 1);
};
