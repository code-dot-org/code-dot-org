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
  if (window.AudioContext) {
    this.audioContext = new AudioContext();
  }

  this.soundsById = {};
}

Sounds.prototype.register = function (config) {
  var sound = new Sound(config, this.audioContext);
  this.soundsById[config.id] = sound;
  sound.preload();
};

Sounds.prototype.play = function (soundId) {
  var sound = this.soundsById[soundId];
  sound.play();
};

Sounds.prototype.get = function (soundId) {
  return this.soundsById[soundId];
};

function Sound(config, audioContext) {
  this.config = config;
  this.audioContext = audioContext;
  this.audioElement = null; // if HTML5 Audio
  this.reusableBuffer = null; // if Web Audio
}

Sound.prototype.play = function () {
  if (!this.audioElement && !this.reusableBuffer) {
    return;
  }

  if (this.reusableBuffer) {
    var temporaryPlayableBuffer = this.newPlayableBufferSource(this.reusableBuffer);
    // Play sound, supporting older versions of the Web Audio API which used noteOn(Off).
    temporaryPlayableBuffer.start ? temporaryPlayableBuffer.start(0) : temporaryPlayableBuffer.noteOn(0);
    return;
  }

  if (isMobile()) {
    // Don't play HTML 5 audio on mobile
    return;
  }

  this.audioElement.volume = 1;
  this.audioElement.loop = false;
  this.audioElement.play();
};

Sound.prototype.newPlayableBufferSource = function(buffer) {
  var newSound = this.audioContext.createBufferSource();
  newSound.buffer = buffer;
  newSound.loop = false;
  newSound.connect(this.audioContext.destination);
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

  if (window.AudioContext) {
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
