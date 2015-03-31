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
 * @param {function} changeCallback
 * @constructor
 */
var NetSimBandwidthControl = module.exports = function (rootDiv, changeCallback) {
  NetSimSlider.LogarithmicSlider.call(this, rootDiv, {
    onChange: changeCallback,
    value: Infinity,
    min: 4,
    max: 128 * BITS_PER_KILOBIT,
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
  if (val === Infinity) {
    return i18n.unlimited();
  }

  var gbps = Math.floor(val / BITS_PER_GIGABIT);
  if (gbps > 0) {
    return i18n.x_Gbps({ x: gbps });
  }

  var mbps = Math.floor(val / BITS_PER_MEGABIT);
  if (mbps > 0) {
    return i18n.x_Mbps({ x: mbps });
  }

  var kbps = Math.floor(val / BITS_PER_KILOBIT);
  if (kbps > 0) {
    return i18n.x_Kbps({ x: kbps });
  }

  return i18n.x_bps({ x: val });
};
