/** @file A three-part loopable audio effect (start-loop-end). */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var debugLogging = false;
function debug(msg) {
  if (debugLogging && console && console.info) {
    console.info('Audio: ' + msg);
  }
}

/** @enum {number} */
var PlaybackState = {
  NONE: 'none',
  BEGIN: 'begin',
  LOOP: 'loop',
  END: 'end'
};

/**
 * A loopable audio effect defined with three parts (start, middle, end) so that
 * you can get a smooth start/finish effect.
 *
 * Assumes the audio clips in question have already been preloaded by another
 * system.
 *
 * @param {AudioPlayer} audioPlayer
 * @param {string} begin - Audio clip name for start of sound.
 * @param {string} loop - Audio clip name for loopable part of sound.
 * @param {string} end - Audio clip name for end of sound.
 * @constructor
 */
var ThreeSliceAudio = function (audioPlayer, begin, loop, end) {
  /** @private {PlaybackState} */
  this.state_ = PlaybackState.NONE;
  /** @private {AudioPlayer} */
  this.audioPlayer_ = audioPlayer;
  /** @private {string} */
  this.beginClipName_ = begin;
  /** @private {string} */
  this.loopClipName_ = loop;
  /** @private {string} */
  this.endClipName_ = end;
};
module.exports = ThreeSliceAudio;

/**
 * Turn on the audio effect, causing it to begin and then transition to the loop.
 * Will do nothing if the effect is already playing, so safe to call often (on
 * a key-repeat, for example).
 */
ThreeSliceAudio.prototype.on = function () {
  if (this.state_ === PlaybackState.NONE || this.state_ === PlaybackState.END) {
    debug('on');
    this.enterState_(PlaybackState.BEGIN);
  }
};

/**
 * Turn off the audio effect.  If the loop has not started yet (the sound is
 * still starting up) then it will just stop immediately.  If the loop has
 * started, the end effect will be played and then the audio will stop.
 */
ThreeSliceAudio.prototype.off = function () {
  debug('off');
  if (this.state_ === PlaybackState.BEGIN || this.state_ === PlaybackState.LOOP) {
    this.enterState_(PlaybackState.END);
  }
};

ThreeSliceAudio.prototype.enterState_ = function (state) {
  this.exitState_(this.state_);
  debug(this.state_ + ' -> ' + state);
  this.state_ = state;
  var callback = this.whenSoundStopped_.bind(this, state);
  if (state === PlaybackState.BEGIN) {
    if (this.beginClipName_) {
      this.audioPlayer_.play(this.beginClipName_, { onEnded: callback });
    } else {
      this.enterState_(PlaybackState.LOOP);
    }
  } else if (state === PlaybackState.LOOP) {
    if (this.loopClipName_) {
      this.audioPlayer_.play(this.loopClipName_, { loop: true, onEnded: callback });
    } else {
      this.enterState_(PlaybackState.END);
    }
  } else if (state === PlaybackState.END) {
    if (this.endClipName_) {
      this.audioPlayer_.play(this.endClipName_, { onEnded: callback });
    } else {
      this.enterState_(PlaybackState.NONE);
    }
  }
};

ThreeSliceAudio.prototype.exitState_ = function (state) {
  if (state === PlaybackState.BEGIN && this.beginClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.beginClipName_);
  } else if (state === PlaybackState.LOOP && this.loopClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.loopClipName_);
  } else if (state === PlaybackState.END && this.endClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.endClipName_);
  }
};

ThreeSliceAudio.prototype.whenSoundStopped_ = function (stoppedState) {
  debug('soundStopped (' + stoppedState + ')');
  if (stoppedState === PlaybackState.BEGIN && this.state_ === PlaybackState.BEGIN) {
    this.enterState_(PlaybackState.LOOP);
  } else if (stoppedState === PlaybackState.END && this.state_ === PlaybackState.END) {
    this.enterState_(PlaybackState.NONE);
  }
};
