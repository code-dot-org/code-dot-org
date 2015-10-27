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


/**
 * A helper class that handles loading, choosing, playing and stopping
 * background music for Playlab.
 *
 * @param {AudioPlayer} audioPlayer - Reference to the Sounds object.
 * @param {function} assetUrl - Function for generating paths to static assets
 *        for the current skin.
 * @param {string[]} [musicFilenames] - List of music asset names (sans
 *        extensions). Can be omitted if no music should be played.
 * @constructor
 */
var MusicController = function (audioPlayer, assetUrl, musicFilenames) {
  /** @private {AudioPlayer} */
  this.audioPlayer_ = audioPlayer;

  /** @private {function} */
  this.assetUrl_ = assetUrl;

  /** @private {string[]} */
  this.musicNames_ = musicFilenames || [];

  /** @private {Object[]} */
  this.musicFiles_ = {};

  /** @private {string} */
  this.nowPlayingName_ = null;
};
module.exports = MusicController;

/**
 * Preload all music assets,
 */
MusicController.prototype.preload = function () {
  if (!this.audioPlayer_) {
    return;
  }

  this.musicNames_.forEach(function (musicName) {
    this.musicFiles_[musicName] = [
      this.assetUrl_(musicName + '.mp3'),
      this.assetUrl_(musicName + '.ogg')];
    this.audioPlayer_.registerByFilenamesAndID(this.musicFiles_[musicName], musicName);
  }, this);

  // By default, set the first music sound to play on load
  var firstMusic = this.musicNames_[0];
  if (firstMusic) {
    var sound = this.audioPlayer_.get(firstMusic);
    if (sound) {
      sound.onLoad = function () {
        this.play(firstMusic);
      }.bind(this);
    }
  }
};

/**
 * Begins playing a particular piece of music immediately.
 * @param {string} musicName
 */
MusicController.prototype.play = function (musicName) {
  if (!this.audioPlayer_) {
    return;
  }

  var sound = this.audioPlayer_.get(musicName);
  if (sound) {
    var callback = this.whenMusicStopped_.bind(this, musicName);
    sound.play({ onEnded: callback });
    this.nowPlaying_ = musicName;
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
