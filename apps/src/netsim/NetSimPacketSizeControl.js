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

var i18n = require('./locale');
var NetSimSlider = require('./NetSimSlider');

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} packetSizeChangeCallback
 * @param {Object} options
 * @param {number} options.minimumPacketSize
 * @constructor
 * @augments NetSimSlider
 */
var NetSimPacketSizeControl = module.exports = function (rootDiv,
    packetSizeChangeCallback, options) {
  NetSimSlider.call(this, rootDiv, {
    onChange: packetSizeChangeCallback,
    min: options.minimumPacketSize,
    max: 1024,
    upperBoundInfinite: true
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimPacketSizeControl.inherits(NetSimSlider);

/**
 * Get localized packet size description for the given packet size.
 * @param {number} packetSize
 * @returns {string}
 */
NetSimPacketSizeControl.prototype.getPacketSizeText = function (packetSize) {
  if (packetSize === Infinity) {
    return i18n.unlimited();
  }
  return i18n.numBitsPerPacket({ x: packetSize });
};

/**
 * Converts a numeric value (in bits) into a compact localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimPacketSizeControl.prototype.valueToLabel = function (val) {
  if (val === Infinity) {
    return i18n.unlimited();
  }
  return i18n.numBitsPerPacket({x: val});
};

/**
 * Get labels for end sliders
 * @param {number} val
 * @returns {string}
 * @override
 */
NetSimPacketSizeControl.prototype.valueToShortLabel = function (val) {
  if (val === Infinity) {
    return i18n.unlimited();
  }
  return val;
};
