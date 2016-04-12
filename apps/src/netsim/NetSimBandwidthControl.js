/**
 * @overview UI Slider control used for changing simulated router bandwidth.
 */
'use strict';

// Utils required only for Function.prototype.inherits()
require('../utils');
var NetSimConstants = require('./NetSimConstants');
var NetSimUtils = require('./NetSimUtils');
var NetSimSlider = require('./NetSimSlider');

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} sliderChangeCallback
 * @param {function} sliderStopCallback
 * @constructor
 */
var NetSimBandwidthControl = module.exports = function (rootDiv,
    sliderChangeCallback, sliderStopCallback) {
  NetSimSlider.LogarithmicSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    onStop: sliderStopCallback,
    value: Infinity,
    min: 4,
    max: 128 * NetSimConstants.BITS_PER_KILOBIT,
    upperBoundInfinite: true
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimBandwidthControl.inherits(NetSimSlider.LogarithmicSlider);

/**
 * Converts a numeric bandwidth value (in bits) into a compact localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimBandwidthControl.prototype.valueToLabel = function (val) {
  return NetSimUtils.bitrateToLocalizedRoundedBitrate(val);
};
