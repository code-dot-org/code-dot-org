function isMobile() {
  return 'ontouchstart' in document.documentElement;
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
 * @param {Object} config available sound files for this audio
 * @property {boolean} allowHTML5Mobile
 * @property {boolean} playAfterLoad
 * @property {boolean} forceHTML5
 * @property {Object} playAfterLoadOptions
 * @property {string} mp3
 * @property {string} ogg
 * @property {string} wav
 * @property {bytes} bytes
 * @property {function} onPreloadError
 * @param audioContext context this sound can be played on, or null if none
 * @constructor
 */
export default function Sound(config, audioContext) {
  this.config = config;
  this.audioContext = audioContext;
  this.audioElement = null; // if HTML5 Audio
  this.reusableBuffer = null; // if Web Audio
  this.playableBuffers = []; // if Web Audio
  this.isPlayingCount = 0; // if Web Audio

  /**
   * @private {boolean} Whether the sound is currently playing - sadly, neither
   *          audio system tracks this for us particularly well so we have to
   *          do it ourselves.
   */
  this.isPlaying_ = false;
  /**
   * @private {boolean} Whether the sound is loaded.
   */
  this.isLoaded_ = false;
  /**
   * @private {boolean} Whether the sound failed to load.
   */
  this.didLoadFail_ = false;
}

/**
 * @param {Object} [options]
 * @param {number} [options.volume] default 1.0, which is "no change"
 * @param {boolean} [options.loop] default false
 * @param {function} [options.onEnded]
 * @param {function} [options.callback]
 */
Sound.prototype.play = function(options) {
  options = options || {};
  if (!this.audioElement && !this.reusableBuffer) {
    this.handlePlayFailed(options);
    return;
  }

  if (this.reusableBuffer) {
    let index =
      this.playableBuffers.push(
        this.newPlayableBufferSource(this.reusableBuffer, options)
      ) - 1;

    // Hook up on-ended callback, although browser support may be limited.
    this.playableBuffers[index].onended = function() {
      this.isPlayingCount--;
      if (this.isPlayingCount === 0) {
        this.isPlaying_ = false;
        options.onEnded && options.onEnded();
      }
    }.bind(this);

    // Play sound, supporting older versions of the Web Audio API which used noteOn(Off).
    if (this.playableBuffers[index].start) {
      this.playableBuffers[index].start(0);
    } else {
      this.playableBuffers[index].noteOn(0);
    }
    this.handlePlayStarted(options);
    return;
  }

  if (!this.config.allowHTML5Mobile && isMobile()) {
    // Don't play HTML 5 audio on mobile
    this.handlePlayFailed(options);
    return;
  }

  var volume =
    typeof options.volume === 'undefined'
      ? 1
      : Math.max(0, Math.min(1, options.volume));
  this.audioElement.volume = volume;
  this.audioElement.loop = !!options.loop;
  var unregisterAndCallback = function() {
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
  this.handlePlayStarted(options);
};

Sound.prototype.playAfterLoad = function(options) {
  if (this.isLoaded() || this.config.playAfterLoad) {
    // If this sound is already loaded, or playAfterLoad has already been
    // set on this sound, then we must fail this play request
    this.handlePlayFailed(options);
    return;
  }
  // Store the options and play the sound once the load has completed
  this.config.playAfterLoad = true;
  this.config.playAfterLoadOptions = options;
};

Sound.prototype.handlePlayFailed = function(options) {
  if (options.callback) {
    options.callback(false);
  }
};

Sound.prototype.handleLoadFailed = function(status) {
  this.didLoadFail_ = true;
  const {onPreloadError, playAfterLoadOptions} = this.config;

  // If the song was loaded via preload, notify the caller.
  onPreloadError && onPreloadError(status);

  // If the song was to be played upon load, notify the caller.
  const callback = playAfterLoadOptions && playAfterLoadOptions.callback;
  callback && callback(false);
};

Sound.prototype.handlePlayStarted = function(options) {
  this.isPlayingCount++;
  this.isPlaying_ = true;
  if (options.callback) {
    options.callback(true);
  }
};

Sound.prototype.stop = function() {
  try {
    if (this.playableBuffers.length) {
      for (let index in this.playableBuffers) {
        if (this.playableBuffers[index].stop) {
          // Newest web audio pseudo-standard.
          this.playableBuffers[index].stop(0);
        } else if (this.playableBuffers[index].noteOff) {
          // Older web audio.
          this.playableBuffers[index].noteOff(0);
        }
        this.isPlayingCount--;
      }
    } else if (this.audioElement) {
      // html 5 audio.
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
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
Sound.prototype.isPlaying = function() {
  return this.isPlaying_;
};

/**
 * @returns {boolean} whether the sound is currently loaded.
 */
Sound.prototype.isLoaded = function() {
  return this.isLoaded_;
};

/**
 * @returns {boolean} whether the sound failed to load.
 */
Sound.prototype.didLoadFail = function() {
  return this.didLoadFail_;
};

Sound.prototype.newPlayableBufferSource = function(buffer, options) {
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
  var startingVolume =
    typeof options.volume === 'undefined' ? 1 : options.volume;
  this.gainNode.gain.value = startingVolume;
  return newSound;
};

/**
 * Do an exponential fade from the current gain to a new given value, over the
 * given number of seconds.
 * @param {number} gain - desired final gain value
 * @param {number} durationSeconds
 */
Sound.prototype.fadeToGain = function(gain, durationSeconds) {
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
Sound.prototype.fadeToGainWebAudio_ = function(gain, durationSeconds) {
  if (!this.gainNode) {
    return;
  }

  // Can't exponential ramp to zero, simulate by getting close.
  if (gain === 0) {
    gain = 0.01;
  }

  var currTime = this.audioContext.currentTime;
  this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
  this.gainNode.gain.exponentialRampToValueAtTime(
    gain,
    currTime + durationSeconds
  );
};

/**
 * Do an exponential fade from the current gain to a new given value, over the
 * given number of seconds.
 * Using HTML5 Audio (fallback player)
 * @param {number} gain - desired final gain value
 * @param {number} durationSeconds
 * @private
 */
Sound.prototype.fadeToGainHtml5Audio_ = function(gain, durationSeconds) {
  if (!this.audioElement) {
    return;
  }

  var startVolume = this.audioElement.volume || 1;
  var finalVolume = Math.max(0, Math.min(1, gain));
  var deltaVolume = finalVolume - startVolume;
  var durationMillis = durationSeconds * 1000;
  var t0 = new Date().getTime();
  var fadeInterval = setInterval(
    function() {
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
      var newVolume =
        deltaVolume * Math.pow(t / durationMillis, 2) + startVolume;
      this.audioElement.volume = Math.max(0, Math.min(1, newVolume));
    }.bind(this),
    100
  );
};

Sound.prototype.getPlayableFile = function() {
  // IE9 Running on Windows Server SKU can throw an exception on window.Audio
  try {
    if (!window.Audio) {
      return false;
    }

    var audioTest = new window.Audio();

    if (
      this.config.hasOwnProperty('mp3') &&
      audioTest.canPlayType('audio/mp3')
    ) {
      return this.config.mp3;
    }
    if (
      this.config.hasOwnProperty('ogg') &&
      audioTest.canPlayType('audio/ogg')
    ) {
      return this.config.ogg;
    }
    if (
      this.config.hasOwnProperty('wav') &&
      audioTest.canPlayType('audio/wav')
    ) {
      return this.config.wav;
    }
  } catch (e) {}

  return false;
};

/**
 * Checks if bytes were provided and we are able to play them after decoding.
 */
Sound.prototype.getPlayableBytes = function() {
  try {
    if (!window.Audio) {
      return false;
    }

    let audioTest = new window.Audio();
    if (
      this.config.hasOwnProperty('bytes') &&
      audioTest.canPlayType('audio/mp3')
    ) {
      return this.config.bytes;
    }
  } catch (e) {
    console.warn('No bytes provided or mp3 is not supported');
  }

  return false;
};

Sound.prototype.preloadFile = function() {
  const file = this.getPlayableFile();
  if (!file) {
    return;
  }

  if (!this.config.forceHTML5 && window.AudioContext && this.audioContext) {
    var self = this;
    this.preloadViaWebAudio(file, buffer => {
      self.reusableBuffer = buffer;
    });
    return;
  }

  if (window.Audio) {
    let audioElement = new window.Audio(file);
    this.preloadAudioElement(audioElement);
  }
};

Sound.prototype.preloadBytes = function() {
  const bytes = this.getPlayableBytes();
  if (!bytes) {
    return;
  }

  if (!this.config.forceHTML5 && window.AudioContext && this.audioContext) {
    var self = this;
    self.audioContext.decodeAudioData(bytes, buffer => {
      self.reusableBuffer = buffer;
      self.onSoundLoaded();
    });
    return;
  }

  if (window.Audio) {
    const blob = new Blob([bytes], {type: 'audio/mpeg3'});
    const url = window.URL.createObjectURL(blob);
    const audioElement = new window.Audio(url);
    this.preloadAudioElement(audioElement);
  }
};

Sound.prototype.preloadAudioElement = function(audioElement) {
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
  var eventListener = function() {
    this.onSoundLoaded();
    audioElement.removeEventListener(loadEventName, eventListener);
  }.bind(this);
  audioElement.addEventListener(loadEventName, eventListener);
  audioElement.addEventListener('error', () => {
    // Indicate failure without the http status code since it is not
    // available in this context.
    this.handleLoadFailed();
  });
};

Sound.prototype.onSoundLoaded = function() {
  this.isLoaded_ = true;
  if (this.config.playAfterLoad) {
    this.play(this.config.playAfterLoadOptions);
  }
  if (this.onLoad) {
    this.onLoad();
  }
};

Sound.prototype.preloadViaWebAudio = function(filename, onPreloadedCallback) {
  var request = new XMLHttpRequest();
  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';
  var self = this;
  request.onload = function() {
    if (request.status === 200) {
      self.audioContext.decodeAudioData(request.response, function(buffer) {
        onPreloadedCallback(buffer);
        self.onSoundLoaded();
      });
    } else {
      self.handleLoadFailed(request.status);
    }
  };
  request.onerror = function() {
    self.handleLoadFailed(request.status);
  };
  request.send();
};
