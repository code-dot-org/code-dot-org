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

require('../utils');
var i18n = require('../../locale/current/netsim');
var NetSimSlider = require('./NetSimSlider');

/**
 * @type {number}
 * @const
 */
var BITS_PER_BYTE = 8;

/**
 * @type {number}
 * @const
 */
var BITS_PER_KILOBYTE = 1024 * BITS_PER_BYTE;

/**
 * @type {number}
 * @const
 */
var BITS_PER_MEGABYTE = 1024 * BITS_PER_KILOBYTE;

/**
 * @type {number}
 * @const
 */
var BITS_PER_GIGABYTE = 1024 * BITS_PER_MEGABYTE;

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} changeCallback
 * @constructor
 */
var NetSimMemoryControl = module.exports = function (rootDiv, changeCallback) {
  NetSimSlider.LogarithmicSlider.call(this, rootDiv, {
    onChange: changeCallback,
    value: Infinity,
    min: BITS_PER_BYTE,
    max: BITS_PER_MEGABYTE,
    upperBoundInfinite: true
  });

  // Auto-render, unlike our base class
  this.render();
};
NetSimMemoryControl.inherits(NetSimSlider.LogarithmicSlider);

/**
 * Converts a numeric memory value (in bits) into a compact localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimMemoryControl.prototype.valueToLabel = function (val) {
  if (val === Infinity) {
    return i18n.unlimited();
  }

  var gbytes = Math.floor(val / BITS_PER_GIGABYTE);
  if (gbytes > 0) {
    return i18n.x_GBytes({ x: gbytes });
  }

  var mbytes = Math.floor(val / BITS_PER_MEGABYTE);
  if (mbytes > 0) {
    return i18n.x_MBytes({ x: mbytes });
  }

  var kbytes = Math.floor(val / BITS_PER_KILOBYTE);
  if (kbytes > 0) {
    return i18n.x_KBytes({ x: kbytes });
  }

  var bytes = Math.floor(val / BITS_PER_BYTE);
  if (bytes > 0) {
    return i18n.x_Bytes({ x: bytes });
  }

  return i18n.x_bits({ x: val });
};

