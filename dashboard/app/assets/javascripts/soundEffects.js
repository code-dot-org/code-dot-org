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
 */
function Sounds() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  this.audioContext = null;

  if (window.AudioContext) {
    try {
      this.audioContext = new AudioContext();
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
}

Sounds.prototype.register = function (config) {
  var sound = new Sound(config, this.audioContext);
  this.soundsById[config.id] = sound;
  sound.preload();
};

Sounds.prototype.play = function (soundId, options) {
  var sound = this.soundsById[soundId];
  sound.play(options);
};

Sounds.prototype.stopLoopingAudio = function (soundId) {
  var sound = this.soundsById[soundId];
  sound.stop();
};

Sounds.prototype.get = function (soundId) {
  return this.soundsById[soundId];
};

/**
 * Initialize an individual sound
 * @param config available sound files for this audio
 * @param audioContext context this sound can be played on, or null if none
 * @constructor
 */
function Sound(config, audioContext) {
  this.config = config;
  this.audioContext = audioContext;
  this.audioElement = null; // if HTML5 Audio
  this.reusableBuffer = null; // if Web Audio
  this.playableBuffer = null; // if Web Audio
}

Sound.prototype.play = function (options) {
  options = options || {};
  if (!this.audioElement && !this.reusableBuffer) {
    return;
  }

  if (this.reusableBuffer) {
    this.playableBuffer = this.newPlayableBufferSource(this.reusableBuffer, options);
    // Play sound, supporting older versions of the Web Audio API which used noteOn(Off).
    this.playableBuffer.start ? this.playableBuffer.start(0) : this.playableBuffer.noteOn(0);
    return;
  }

  if (isMobile()) {
    // Don't play HTML 5 audio on mobile
    return;
  }

  this.audioElement.volume = typeof options.volume === "undefined" ? 1 : options.volume;
  this.audioElement.loop = !!options.loop;
  this.audioElement.play();
};

Sound.prototype.stop = function () {
  try {
    if (this.playableBuffer) {
      if (this.playableBuffer.stop) {  // Newest web audio pseudo-standard.
        this.playableBuffer.stop(0);
      } else if (this.playableBuffer.noteOff) {  // Older web audio.
        this.playableBuffer.noteOff(0);
      }
    } else if (this.audioElement) {
      // html 5 audio.
      this.audioElement.pause();
    }
  } catch (e) {
    if (e.name === 'InvalidStateError') {
      // Stopping a sound that hasn't been played.
    } else {
      throw e;
    }
  }
};

Sound.prototype.newPlayableBufferSource = function(buffer, options) {
  var newSound = this.audioContext.createBufferSource();

  // Older versions of chrome call this createGainNode instead of createGain
  var gainNode;
  if (this.audioContext.createGain) {
    gainNode = this.audioContext.createGain();
  } else if (this.audioContext.createGainNode) {
    gainNode = this.audioContext.createGainNode();
  } else {
    return null;
  }

  newSound.buffer = buffer;
  newSound.loop = !!options.loop;
  newSound.connect(gainNode);
  gainNode.connect(this.audioContext.destination);
  gainNode.gain.value = typeof options.volume === "undefined" ? 1 : options.volume;

  return newSound;
};

function isMobile() {
  return ('ontouchstart' in document.documentElement);
}

function isIE9() {
  var version = -1;

  if (/MSIE\s([\d.]+)/.test(navigator.userAgent)) {
    version = new Number(RegExp.$1);
  }

  return version === 9
}

Sound.prototype.getPlayableFile = function () {
  if (!window.Audio) {
    return false;
  }

  var audioTest = new window.Audio();

  if (this.config.hasOwnProperty('mp3') && audioTest.canPlayType('audio/mp3')) {
    return this.config.mp3;
  }
  if (this.config.hasOwnProperty('ogg') && audioTest.canPlayType('audio/ogg')) {
    return this.config.ogg;
  }
  if (this.config.hasOwnProperty('wav') && audioTest.canPlayType('audio/wav')) {
    return this.config.wav;
  }

  return false;
};

Sound.prototype.preload = function () {
  var file = this.getPlayableFile();
  if (!file) {
    return;
  }

  if (window.AudioContext && this.audioContext) {
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
      // Pre-cache audio
      audioElement.play();
      audioElement.pause();
    }
    this.audioElement = audioElement;
  }
};

Sound.prototype.preloadViaWebAudio = function (filename, onPreloadedCallback) {
  var request = new XMLHttpRequest();
  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';
  var self = this;
  request.onload = function () {
    self.audioContext.decodeAudioData(request.response, function (buffer) {
      onPreloadedCallback(buffer);
    });
  };
  request.send();
};
