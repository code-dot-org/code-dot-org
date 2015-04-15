/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

// Utils required only for Function.prototype.inherits()
require('../utils');
var netsimConstants = require('./netsimConstants');
var netsimUtils = require('./netsimUtils');
var NetSimSlider = require('./NetSimSlider');

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} sliderChangeCallback
 * @constructor
 */
var NetSimBitrateControl = module.exports = function (rootDiv,
    sliderChangeCallback) {
  NetSimSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    value: Infinity,
    min: 0.2,
    max: 5.0,
    step: 0.2
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimBitrateControl.inherits(NetSimSlider);

/**
 * Converts a numeric bitrate value (in bits per second) into a
 * localized string representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimBitrateControl.prototype.valueToLabel = function (val) {
  return netsimUtils.bitrateToLocalizedRoundedBitrate(val);
};

/**
 * Converts a numeric bitrate value (in bits per second) into a compact
 * localized string representation of that value, used for ends of the slider.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimBitrateControl.prototype.valueToShortLabel = function (val) {
  return netsimUtils.bitrateToLocalizedRoundedBitrate(val);
};
