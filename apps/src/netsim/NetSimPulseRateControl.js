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
var i18n = require('../../locale/current/netsim');
var NetSimSlider = require('./NetSimSlider');

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {number} initialValue - in pulses/second
 * @param {function} sliderChangeCallback
 * @constructor
 */
var NetSimPulseRateControl = module.exports = function (rootDiv, initialValue,
    sliderChangeCallback) {
  NetSimSlider.DecimalPrecisionSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    value: initialValue,
    min: 0.1,
    max: 2.0,
    step: 0.1
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimPulseRateControl.inherits(NetSimSlider.DecimalPrecisionSlider);

/**
 * Converts a numeric bitrate value (in bits per second) into a
 * localized string representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimPulseRateControl.prototype.valueToLabel = function (val) {
  if (val === 1) {
    return i18n.xPulsePerSecond({ x: val });
  }
  return i18n.xPulsesPerSecond({ x: val });
};

/**
 * Converts a numeric bitrate value (in bits per second) into a compact
 * localized string representation of that value, used for ends of the slider.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimPulseRateControl.prototype.valueToShortLabel = function (val) {
  return val;
};
