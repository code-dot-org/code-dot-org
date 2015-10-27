/** @file The maestro! Helper that knows which music tracks can be played, and
 *        which one is playing now, and selects and plays them appropriately. */
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

var utils = require('../utils');

var debugLogging = true;
function debug(msg) {
  if (debugLogging && console && console.info) {
    console.info('MusicController: ' + msg);
  }
}

/**
 * @typedef {Object} MusicTrack
 * @property {string} name
 * @property {string[]} assetUrls
 * @property {Sound} sound
 * @property {boolean} isLoaded
 */

/**
 * A helper class that handles loading, choosing, playing and stopping
 * background music for Playlab.
 *
 * @param {AudioPlayer} audioPlayer - Reference to the Sounds object.
 * @param {function} assetUrl - Function for generating paths to static assets
 *        for the current skin.
 * @param {string[]} [trackNames] - List of music asset names (sans
 *        extensions). Can be omitted if no music should be played.
 * @constructor
 */
var MusicController = function (audioPlayer, assetUrl, trackNames) {
  /** @private {AudioPlayer} */
  this.audioPlayer_ = audioPlayer;

  /** @private {function} */
  this.assetUrl_ = assetUrl;

  /** @private {string[]} */
  this.trackNames_ = trackNames || [];

  /** @private {Object} maps trackName => MusicTrack */
  this.tracks_ = buildTrackMap(this.trackNames_, assetUrl);

  /** @private {string} */
  this.nowPlayingName_ = null;

  this.playOnLoad_ = null;

  debug('constructed');

  $('.video-modal').on('shown.bs.modal', function() {
    this.fadeOut();
  }.bind(this));
};
module.exports = MusicController;

/**
 * Build up an initial map of trackName -> MusicTrack object, without doing
 * any asset loading.
 * @param {string{}} trackNames
 * @param {function} assetUrl
 */
function buildTrackMap(trackNames, assetUrl) {
  var tracks = trackNames.map(function (name) {
    return {
      name: name,
      assetUrls: [ assetUrl(name + '.mp3'), assetUrl(name + '.ogg') ],
      sound: null,
      isLoaded: false
    };
  });
  return tracks.reduce(function (memo, next) {
    memo[next.name] = next;
    return memo;
  }, {});
}

/**
 * Preload all music assets,
 */
MusicController.prototype.preload = function () {
  if (!this.audioPlayer_) {
    return;
  }

  this.trackNames_.forEach(function (name) {
    this.tracks_[name].sound = this.audioPlayer_.registerByFilenamesAndID(
        this.tracks_[name].assetUrls, name);
    this.tracks_[name].sound.onLoad = function () {
      debug('done loading ' + name);
      this.tracks_[name].isLoaded = true;
      if (this.playOnLoad_ === name) {
        this.play(name);
      }
    }.bind(this);
  }.bind(this));
};

/**
 * Begins playing a particular piece of music immediately.
 * @param {string} trackName
 */
MusicController.prototype.play = function (trackName) {
  debug('play ' + trackName);
  if (!this.audioPlayer_) {
    return;
  }

  if (!trackName) {
    trackName = this.trackNames_[Math.floor(Math.random(this.trackNames_.length))];
  }

  var track = this.tracks_[trackName];
  if (!track) {
    // Not found - throw exception?
    return;
  }

  if (track.sound && track.isLoaded) {
    debug('playing now');
    var callback = this.whenMusicStopped_.bind(this, trackName);
    track.sound.play({ onEnded: callback });
    this.nowPlaying_ = trackName;
  } else {
    debug('not done loading, playing after load');
    this.playOnLoad_ = trackName;
  }
};

/**
 * Stops playing whatever music is currently playing, immediately.
 */
MusicController.prototype.stop = function () {
  if (!this.nowPlaying_) {
    return;
  }

  var sound = this.audioPlayer_.get(this.nowPlaying_);
  if (sound) {
    sound.stop();
  }
};

/**
 * Fades music to nothing, then stops it.
 * @param {number} [durationSeconds] in seconds.  Default 3.
 */
MusicController.prototype.fadeOut = function (durationSeconds) {
  if (!this.nowPlaying_) {
    return;
  }

  durationSeconds = utils.valueOr(durationSeconds, 3);

  // Trigger a fade
  var sound = this.audioPlayer_.get(this.nowPlaying_);
  if (sound) {
    sound.fadeToGain(0, durationSeconds);
  }

  // Stop the audio after the fade.
  setTimeout(function () {
    this.stop();
  }.bind(this), 1000 * durationSeconds);
};

/**
 * Callback for when music stops, to update internal state.
 * @param {string} musicName that was playing.  Should be bound when music
 *        is started.
 * @private
 */
MusicController.prototype.whenMusicStopped_ = function (musicName) {
  if (this.nowPlaying_ === musicName) {
    this.nowPlaying_ = null;
  }
};
