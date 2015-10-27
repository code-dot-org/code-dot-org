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
  this.audioPlayer_ = audioPlayer;
  this.assetUrl_ = assetUrl;

  /** @private {string[]} */
  this.musicNames_ = musicFilenames || [];

  this.musicFiles_ = {};
};
module.exports = MusicController;

/**
 * Preload all music assets,
 */
MusicController.prototype.preload = function () {
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
        sound.play({loop: true});
      };
    }
  }
};
