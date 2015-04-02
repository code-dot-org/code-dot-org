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
var EncodingType = require('./netsimConstants').EncodingType;

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

  /**
   * Fill in the blank: "8 bits per _"
   * @type {string}
   * @private
   */
  this.currentUnitString_ = i18n.byte();

  // Auto-render, unlike our parent class
  this.render();
};
NetSimChunkSizeControl.inherits(NetSimSlider);

/**
 * @param {EncodingType[]} newEncodings
 */
NetSimChunkSizeControl.prototype.setEncodings = function (newEncodings) {
  if (newEncodings.indexOf(EncodingType.ASCII) > -1) {
    this.currentUnitString_ = i18n.character();
  } else if (newEncodings.indexOf(EncodingType.DECIMAL) > -1) {
    this.currentUnitString_ = i18n.number();
  } else {
    this.currentUnitString_ = i18n.byte();
  }

  // Force refresh of slider widget label
  this.setLabelFromValue_(this.value_);
};

/**
 * Converts an external-facing numeric value into a localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimChunkSizeControl.prototype.valueToLabel = function (val) {
  return i18n.numBitsPerChunkType({
    numBits: val,
    chunkType: this.currentUnitString_
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
