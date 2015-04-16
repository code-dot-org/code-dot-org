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
var NetSimPulseRateControl = require('./NetSimPulseRateControl');
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
  this.pulsesPerSecond_ = 1;

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
   * @type {NetSimPulseRateControl}
   * @private
   */
  this.pulseRateControl_ = null;

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

  if (this.levelConfig_.showMetronome) {
    this.metronome_ = new NetSimMetronome(
        this.rootDiv_.find('.metronome'),
        this.runLoop_);
    this.metronome_.setFrequency(this.pulsesPerSecond_);

    this.pulseRateControl_ = new NetSimPulseRateControl(
        this.rootDiv_.find('.pulse-rate'),
        1 / this.pulsesPerSecond_,
        this.pulseRateSliderChange_.bind(this));
  }

  this.chunkSizeControl_ = new NetSimChunkSizeControl(
      this.rootDiv_.find('.chunk-size'),
      this.chunkSizeSliderChangeCallback_);

  if (this.levelConfig_.showEncodingControls.length > 0) {
    this.encodingControl_ = new NetSimEncodingControl(
        this.rootDiv_.find('.encoding'),
        this.levelConfig_,
        this.encodingChangeCallback_);
  }
};

/**
 * Handler for changing the position of the pulse-rate slider
 * @param {number} secondsPerPulse in seconds per pulse
 * @private
 */
NetSimMyDeviceTab.prototype.pulseRateSliderChange_ = function (secondsPerPulse) {
  this.pulsesPerSecond_ = 1 / secondsPerPulse;
  this.metronome_.setFrequency(this.pulsesPerSecond_);
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
