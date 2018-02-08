function isMobile() {
  return ('ontouchstart' in document.documentElement);
}

function isIE9() {
  /** @type {number} */
  var version = -1;

  if (/MSIE\s([\d.]+)/.test(navigator.userAgent)) {
    version = parseInt(RegExp.$1);
  }

  return version === 9;
}

/**
 * Initialize an individual sound
 * @param config available sound files for this audio
 * @param audioContext context this sound can be played on, or null if none
 * @constructor
 */
export default function Sound(config, audioContext) {
  this.config = config;
  this.audioContext = audioContext;
  this.audioElement = null; // if HTML5 Audio
  this.reusableBuffer = null; // if Web Audio
  this.playableBuffer = null; // if Web Audio

  /**
   * @private {boolean} Whether the sound is currently playing - sadly, neither
   *          audio system tracks this for us particularly well so we have to
   *          do it ourselves.
   */
  this.isPlaying_ = false;
}

/**
 * @param {Object} [options]
 * @param {number} [options.volume] default 1.0, which is "no change"
 * @param {boolean} [options.loop] default false
 * @param {function} [options.onEnded]
 */
Sound.prototype.play = function (options) {
  options = options || {};
  if (!this.audioElement && !this.reusableBuffer) {
    return;
  }

  if (this.reusableBuffer) {
    this.playableBuffer = this.newPlayableBufferSource(this.reusableBuffer, options);

    // Hook up on-ended callback, although browser support may be limited.
    this.playableBuffer.onended = function () {
      this.isPlaying_ = false;
      if (options.onEnded) {
        options.onEnded();
      }
    }.bind(this);

    // Play sound, supporting older versions of the Web Audio API which used noteOn(Off).
    if (this.playableBuffer.start) {
      this.playableBuffer.start(0);
    } else {
      this.playableBuffer.noteOn(0);
    }
    this.isPlaying_ = true;
    return;
  }

  if (!this.config.allowHTML5Mobile && isMobile()) {
    // Don't play HTML 5 audio on mobile
    return;
  }

  var volume = (typeof options.volume === "undefined") ? 1 :
      Math.max(0, Math.min(1, options.volume));
  this.audioElement.volume = volume;
  this.audioElement.loop = !!options.loop;
  var unregisterAndCallback = function () {
    this.audioElement.removeEventListener('abort', unregisterAndCallback);
    this.audioElement.removeEventListener('ended', unregisterAndCallback);
    this.audioElement.removeEventListener('pause', unregisterAndCallback);
    this.isPlaying_ = false;
    if (options.onEnded) {
      options.onEnded();
    }
  }.bind(this);
  this.audioElement.addEventListener('abort', unregisterAndCallback);
  this.audioElement.addEventListener('ended', unregisterAndCallback);
  this.audioElement.addEventListener('pause', unregisterAndCallback);
  this.audioElement.play();
  this.isPlaying_ = true;
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
  this.isPlaying_ = false;
};

/**
 * @returns {boolean} whether the sound is currently playing.
 */
Sound.prototype.isPlaying = function () {
  return this.isPlaying_;
};

Sound.prototype.newPlayableBufferSource = function (buffer, options) {
  var newSound = this.audioContext.createBufferSource();

  // Older versions of chrome call this createGainNode instead of createGain
  if (this.audioContext.createGain) {
    this.gainNode = this.audioContext.createGain();
  } else if (this.audioContext.createGainNode) {
    this.gainNode = this.audioContext.createGainNode();
  } else {
    return null;
  }

  newSound.buffer = buffer;
  newSound.loop = !!options.loop;
  newSound.connect(this.gainNode);
  this.gainNode.connect(this.audioContext.destination);
  var startingVolume = typeof options.volume === "undefined" ? 1 : options.volume;
  this.gainNode.gain.value = startingVolume;
  return newSound;
};

/**
 * Do an exponential fade from the current gain to a new given value, over the
 * given number of seconds.
 * @param {number} gain - desired final gain value
 * @param {number} durationSeconds
 */
Sound.prototype.fadeToGain = function (gain, durationSeconds) {
  if (this.gainNode) {
    this.fadeToGainWebAudio_(gain, durationSeconds);
  } else if (this.audioElement) {
    this.fadeToGainHtml5Audio_(gain, durationSeconds);
  }
};

/**
 * Do an exponential fade from the current gain to a new given value, over the
 * given number of seconds.
 * Using Web Audio (preferred, but not supported in IE)
 * @param {number} gain - desired final gain value
 * @param {number} durationSeconds
 * @private
 */
Sound.prototype.fadeToGainWebAudio_ = function (gain, durationSeconds) {
  if (!this.gainNode) {
    return;
  }

  // Can't exponential ramp to zero, simulate by getting close.
  if (gain === 0) {
    gain = 0.01;
  }

  var currTime = this.audioContext.currentTime;
  this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
  this.gainNode.gain.exponentialRampToValueAtTime(gain, currTime + durationSeconds);
};

/**
 * Do an exponential fade from the current gain to a new given value, over the
 * given number of seconds.
 * Using HTML5 Audio (fallback player)
 * @param {number} gain - desired final gain value
 * @param {number} durationSeconds
 * @private
 */
Sound.prototype.fadeToGainHtml5Audio_ = function (gain, durationSeconds) {
  if (!this.audioElement) {
    return;
  }

  var startVolume = this.audioElement.volume || 1;
  var finalVolume = Math.max(0, Math.min(1, gain));
  var deltaVolume = finalVolume - startVolume;
  var durationMillis = durationSeconds * 1000;
  var t0 = new Date().getTime();
  var fadeInterval = setInterval(function () {
    var t = new Date().getTime() - t0;

    // Base condition - after duration has elapsed, snap volume to final and
    // clear interval
    if (t >= durationMillis) {
      this.audioElement.volume = finalVolume;
      clearInterval(fadeInterval);
      return;
    }

    // TODO: Probably ought to use ease out quad if delta is positive,
    // TODO: so that cross-fades automatically work as expected.
    // Ease in quad - the ear hears this as a "linear" fade
    // y = c * (t/d)^2 + b
    //   b: initial value
    //   c: final delta
    //   d: duration
    //   t: time
    var newVolume = deltaVolume * Math.pow(t / durationMillis, 2) + startVolume;
    this.audioElement.volume = Math.max(0, Math.min(1, newVolume));
  }.bind(this), 100);
};

Sound.prototype.getPlayableFile = function () {
  // IE9 Running on Windows Server SKU can throw an exception on window.Audio
  try {
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
  } catch (e) {

  }

  return false;
};

Sound.prototype.preload = function () {
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
      // Pre-cache audio
      audioElement.play();
      audioElement.pause();
    }
    this.audioElement = audioElement;

    // Fire onLoad as soon as enough of the sound is loaded to play it
    // all the way through.
    var loadEventName = 'canplaythrough';
    var eventListener = function () {
      this.onSoundLoaded();
      audioElement.removeEventListener(loadEventName, eventListener);
    }.bind(this);
    audioElement.addEventListener(loadEventName, eventListener);
  }
};

Sound.prototype.onSoundLoaded = function () {
  if (this.config.playAfterLoad) {
    this.play(this.config.playAfterLoadOptions);
  }
  if (this.onLoad) {
    this.onLoad();
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
      self.onSoundLoaded();
    });
  };
  request.send();
};
