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

var markup = require('./NetSimBandwidthControl.html.ejs');
var i18n = require('./locale');

/**
 * Min value of 2 is 2^2 or 4bps
 * @type {number}
 * @const
 */
var SLIDER_MIN_VALUE = 2;

/**
 * Slider value is used as the exponent,
 * so max value of 18 here is actually 2^18 or 256Kbps
 * Since the top value is treated as Infinity, that means the max values are:
 *   ---64Kbps----128Kbps----Infinity-|
 * @type {number}
 * @const
 */
var SLIDER_MAX_VALUE = 18;

/**
 * @type {number}
 * @const
 */
var BITS_PER_KILOBIT = 1024;

/**
 * @type {number}
 * @const
 */
var BITS_PER_MEGABIT = 1024 * BITS_PER_KILOBIT;

/**
 * @type {number}
 * @const
 */
var BITS_PER_GIGABIT = 1024 * BITS_PER_MEGABIT;

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} bandwidthChangeCallback
 * @constructor
 */
var NetSimBandwidthControl = module.exports = function (rootDiv,
    bandwidthChangeCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.bandwidthChangeCallback_ = bandwidthChangeCallback;

  /**
   * Internal state
   * @type {number}
   * @private
   */
  this.bandwidth_ = this.sliderValueToBandwidth_(SLIDER_MAX_VALUE);

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimBandwidthControl.prototype.render = function () {
  var renderedMarkup = $(markup({
    minValue: this.getDisplayBandwidth_(this.sliderValueToBandwidth_(SLIDER_MIN_VALUE)),
    maxValue: this.getDisplayBandwidth_(this.sliderValueToBandwidth_(SLIDER_MAX_VALUE))
  }));
  this.rootDiv_.html(renderedMarkup);
  this.rootDiv_.find('.slider').slider({
    value: this.bandwidthToSliderValue_(this.bandwidth_),
    min: SLIDER_MIN_VALUE,
    max: SLIDER_MAX_VALUE,
    step: 1,
    slide: this.onSliderValueChange_.bind(this)
  });
  this.setLabel_(this.bandwidth_);
};

NetSimBandwidthControl.prototype.bandwidthToSliderValue_ = function (bandwidth) {
  if (bandwidth === Infinity) {
    return SLIDER_MAX_VALUE;
  }
  return Math.floor(Math.log(bandwidth) / Math.LN2);
};

NetSimBandwidthControl.prototype.sliderValueToBandwidth_ = function (sliderValue) {
  if (sliderValue === SLIDER_MAX_VALUE) {
    return Infinity;
  }
  return Math.pow(2, sliderValue);
};

/**
 * Change handler for jQueryUI slider control.
 * @param {Event} event
 * @param {Object} ui
 * @param {jQuery} ui.handle - The jQuery object representing the handle that
 *        was changed.
 * @param {number} ui.value - The current value of the slider.
 * @private
 */
NetSimBandwidthControl.prototype.onSliderValueChange_ = function (event, ui) {
  var newPacketSize = this.sliderValueToBandwidth_(ui.value);
  this.setLabel_(newPacketSize);
  this.bandwidthChangeCallback_(newPacketSize);
};

/**
 * Update the slider and its label to display the provided value.
 * @param {number} newBandwidth
 */
NetSimBandwidthControl.prototype.setBandwidth = function (newBandwidth) {
  if (this.bandwidth_ === newBandwidth) {
    return;
  }

  this.bandwidth_ = newBandwidth;
  var sliderValue = this.bandwidthToSliderValue_(newBandwidth);
  this.rootDiv_.find('.slider').slider('option', 'value', sliderValue);
  this.setLabel_(newBandwidth);
};

/**
 * @param {number} newBandwidth
 * @private
 */
NetSimBandwidthControl.prototype.setLabel_ = function (newBandwidth) {
  this.rootDiv_.find('.packet_size_value').text(this.getDisplayBandwidth_(newBandwidth));
};

/**
 * @param {number} bandwidth in bits per second
 * @returns {string} localized, shortened and rounded representation: e.g. 2Kbps
 */
NetSimBandwidthControl.prototype.getDisplayBandwidth_ = function (bandwidth) {
  if (bandwidth === Infinity) {
    return i18n.unlimited();
  }

  var gbps = Math.floor(bandwidth / BITS_PER_GIGABIT);
  if (gbps > 0) {
    return i18n.x_Gbps({ x: gbps });
  }

  var mbps = Math.floor(bandwidth / BITS_PER_MEGABIT);
  if (mbps > 0) {
    return i18n.x_Mbps({ x: mbps });
  }

  var kbps = Math.floor(bandwidth / BITS_PER_KILOBIT);
  if (kbps > 0) {
    return i18n.x_Kbps({ x: kbps });
  }

  return i18n.x_bps({ x: bandwidth });
};
