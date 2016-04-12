/**
 * @overview UI controller for the "My Device" tab in the left column.
 */
'use strict';

var markup = require('./NetSimMyDeviceTab.html.ejs');
var NetSimBitRateControl = require('./NetSimBitRateControl');
var NetSimPulseRateControl = require('./NetSimPulseRateControl');
var NetSimChunkSizeControl = require('./NetSimChunkSizeControl');
var NetSimEncodingControl = require('./NetSimEncodingControl');
var NetSimMetronome = require('./NetSimMetronome');
var NetSimGlobals = require('./NetSimGlobals');

/**
 * Generator and controller for "My Device" tab.
 * @param {jQuery} rootDiv
 * @param {RunLoop} runLoop
 * @param {Object} callbacks
 * @param {function} callbacks.chunkSizeChangeCallback
 * @param {function} callbacks.bitRateChangeCallback
 * @param {function} callbacks.encodingChangeCallback
 * @constructor
 */
var NetSimMyDeviceTab = module.exports = function (rootDiv, runLoop, callbacks) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {RunLoop}
   * @private
   */
  this.runLoop_ = runLoop;

  /**
   * Frequency of metronome pulses, in pulses per second
   * @type {number}
   * @private
   */
  this.bitsPerSecond_ = 1;

  /**
   * @type {function}
   * @private
   */
  this.chunkSizeSliderChangeCallback_ = callbacks.chunkSizeChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.bitRateChangeCallback_ = callbacks.bitRateChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.encodingChangeCallback_ = callbacks.encodingChangeCallback;

  /**
   * @type {NetSimMetronome}
   * @private
   */
  this.metronome_ = null;

  /**
   * @type {NetSimPulseRateControl}
   * @private
   */
  this.pulseRateControl_ = null;

  /**
   * @type {NetSimBitRateControl}
   * @private
   */
  this.bitRateControl_ = null;

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
  var levelConfig = NetSimGlobals.getLevelConfig();

  var renderedMarkup = $(markup({
    level: levelConfig
  }));
  this.rootDiv_.html(renderedMarkup);

  if (levelConfig.showMetronome) {
    this.metronome_ = new NetSimMetronome(
        this.rootDiv_.find('.metronome'),
        this.runLoop_);
    this.metronome_.setFrequency(this.bitsPerSecond_);
  }

  if (levelConfig.showPulseRateSlider) {
    this.pulseRateControl_ = new NetSimPulseRateControl(
        this.rootDiv_.find('.pulse-rate'),
        1 / this.bitsPerSecond_,
        function (secondsPerBit) {
          this.bitRateChangeCallback_(1 / secondsPerBit);
        }.bind(this));
  }

  if (levelConfig.showBitRateControl) {
    this.bitRateControl_ = new NetSimBitRateControl(
        this.rootDiv_.find('.bitrate'),
        this.bitsPerSecond_,
        this.bitRateChangeCallback_);
    if (levelConfig.lockBitRateControl) {
      this.bitRateControl_.disable();
    }
  }

  if (levelConfig.showChunkSizeControl) {
    this.chunkSizeControl_ = new NetSimChunkSizeControl(
        this.rootDiv_.find('.chunk-size'),
        this.chunkSizeSliderChangeCallback_);
    if (levelConfig.lockChunkSizeControl) {
      this.chunkSizeControl_.disable();
    }
  }

  if (levelConfig.showEncodingControls.length > 0) {
    this.encodingControl_ = new NetSimEncodingControl(
        this.rootDiv_.find('.encoding'),
        levelConfig,
        this.encodingChangeCallback_);
  }
};

/**
 * Handler for changing the position of the pulse-rate slider
 * @param {number} secondsPerPulse in seconds per pulse
 * @private
 */
NetSimMyDeviceTab.prototype.pulseRateSliderChange_ = function (secondsPerPulse) {
  this.setBitRate(1 / secondsPerPulse);
};

/**
 * @param {number} bitsPerSecond
 */
NetSimMyDeviceTab.prototype.setBitRate = function (bitsPerSecond) {
  this.bitsPerSecond_ = bitsPerSecond;

  if (this.metronome_) {
    this.metronome_.setFrequency(bitsPerSecond);
  }

  if (this.bitRateControl_) {
    this.bitRateControl_.setValue(bitsPerSecond);
  }

  if (this.pulseRateControl_ && bitsPerSecond < Infinity) {
    this.pulseRateControl_.setValue(1 / bitsPerSecond);
  }
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newChunkSize
 */
NetSimMyDeviceTab.prototype.setChunkSize = function (newChunkSize) {
  if (this.chunkSizeControl_) {
    this.chunkSizeControl_.setValue(newChunkSize);
  }
};

/**
 * @param {EncodingType[]} newEncodings
 */
NetSimMyDeviceTab.prototype.setEncodings = function (newEncodings) {
  if (this.encodingControl_) {
    this.encodingControl_.setEncodings(newEncodings);
  }
};
