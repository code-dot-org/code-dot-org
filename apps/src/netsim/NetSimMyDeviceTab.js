/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var markup = require('./NetSimMyDeviceTab.html');
var NetSimChunkSizeControl = require('./NetSimChunkSizeControl');
var NetSimEncodingControl = require('./NetSimEncodingControl');
var NetSimMetronome = require('./NetSimMetronome');

/**
 * Generator and controller for "My Device" tab.
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {RunLoop} runLoop
 * @param {function} chunkSizeChangeCallback
 * @param {function} encodingChangeCallback
 * @constructor
 */
var NetSimMyDeviceTab = module.exports = function (rootDiv, levelConfig,
    runLoop, chunkSizeChangeCallback, encodingChangeCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  this.runLoop_ = runLoop;

  /**
   * @type {function}
   * @private
   */
  this.chunkSizeSliderChangeCallback_ = chunkSizeChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.encodingChangeCallback_ = encodingChangeCallback;

  /**
   * @type {NetSimMetronome}
   * @private
   */
  this.metronome_ = null;

  /**
   * @type {NetSimChunkSizeControl}
   * @private
   */
  this.chunkSizeControl_ = null;

  /**
   * @type {NetSimEncodingControl}
   * @private
   */
  this.encodingControl_ = null;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimMyDeviceTab.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);

  this.metronome_ = new NetSimMetronome(
      this.rootDiv_.find('.metronome'),
      this.runLoop_);

  this.chunkSizeControl_ = new NetSimChunkSizeControl(
      this.rootDiv_.find('.chunk_size'),
      this.chunkSizeSliderChangeCallback_);

  if (this.levelConfig_.showEncodingControls.length > 0) {
    this.encodingControl_ = new NetSimEncodingControl(
        this.rootDiv_.find('.encoding'),
        this.levelConfig_,
        this.encodingChangeCallback_);
  }
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newChunkSize
 */
NetSimMyDeviceTab.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSizeControl_.setValue(newChunkSize);
};

/**
 * @param {EncodingType[]} newEncodings
 */
NetSimMyDeviceTab.prototype.setEncodings = function (newEncodings) {
  if (this.encodingControl_) {
    this.encodingControl_.setEncodings(newEncodings);
  }
};
