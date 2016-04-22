/**
 * @overview UI slider used to change the local device's chunk size, which
 *           is used when interpreting binary to other formats.
 */
'use strict';

var i18n = require('./locale');
var NetSimSlider = require('./NetSimSlider');
require('../utils'); // Provides Function.prototype.inherits

/**
 * Generator and controller for chunk size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} chunkSizeChangeCallback
 * @constructor
 * @augments NetSimSlider
 */
var NetSimChunkSizeControl = module.exports = function (rootDiv,
    chunkSizeChangeCallback) {
  NetSimSlider.call(this, rootDiv, {
    onChange: chunkSizeChangeCallback,
    min: 1,
    max: 32
  });

  // Auto-render, unlike our parent class
  this.render();
};
NetSimChunkSizeControl.inherits(NetSimSlider);

/**
 * Converts an external-facing numeric value into a localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimChunkSizeControl.prototype.valueToLabel = function (val) {
  return i18n.numBitsPerChunk({
    numBits: val
  });
};

/**
 * Alternate label converter, used for slider end labels.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimChunkSizeControl.prototype.valueToShortLabel = function (val) {
  return val.toString();
};
