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

var i18n = require('../../locale/current/netsim');
var NetSimSlider = require('./NetSimSlider');

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
