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
var netsimUtils = require('./netsimUtils');
var NetSimSlider = require('./NetSimSlider');

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {number} initialValue - in bits per second
 * @param {function} sliderChangeCallback
 * @constructor
 */
var NetSimBitRateControl = module.exports = function (rootDiv, initialValue,
    sliderChangeCallback) {
  NetSimSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    value: initialValue,
    min: 1,
    max: 20
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimBitRateControl.inherits(NetSimSlider);

/**
 * Converts a numeric rate value (in bits pers second) into a
 * localized string representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimBitRateControl.prototype.valueToLabel = function (val) {
  return netsimUtils.bitrateToLocalizedRoundedBitrate(val);
};
