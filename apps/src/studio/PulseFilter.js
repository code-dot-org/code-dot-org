/** @file Increases the brightness of the image up to pure white and back. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/**
 * Increases the brightness of the image up to pure white (still respecting
 * the alpha channel) then decreases it back to normal.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var PulseFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.feFuncR_ = null;

  /** @private {SVGElement} */
  this.feFuncG_ = null;

  /** @private {SVGElement} */
  this.feFuncB_ = null;

  /** @private {function} */
  this.curve_ = makeNormalOscillation(2000, 2, 0, 0.5);
};
PulseFilter.inherits(ImageFilter);
module.exports = PulseFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
PulseFilter.prototype.createFilterSteps_ = function () {
  // Only one step in this filter: Increase brightness of all channels.
  var feComponentTransfer = document.createElementNS(SVG_NS, 'feComponentTransfer');
  this.feFuncR_ = document.createElementNS(SVG_NS, 'feFuncR');
  this.feFuncG_ = document.createElementNS(SVG_NS, 'feFuncG');
  this.feFuncB_ = document.createElementNS(SVG_NS, 'feFuncB');
  [this.feFuncR_, this.feFuncG_, this.feFuncB_].forEach(function (feFunc) {
    feFunc.setAttribute('type', 'linear');
    feFunc.setAttribute('slope', '1');
    feFunc.setAttribute('intercept', '0');
    feComponentTransfer.appendChild(feFunc);
  });

  return [feComponentTransfer];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
PulseFilter.prototype.update = function (timeMs) {
  var newValue = this.curve_(timeMs);
  [this.feFuncR_, this.feFuncG_, this.feFuncB_].forEach(function (feFunc) {
    if (feFunc) {
      feFunc.setAttribute('intercept', newValue);
    }
  });
};

/**
 * Generates a function that given a time value "t" will produce a number
 * between zero and one (inclusive) following a given curve between them.
 *
 * @param {number} period - the t-value for one complete cycle, from max to
 *        min and back to max.  Must be nonzero.
 * @param {number} [curve] - Determines the sharpness of the curve in the
 *        oscillation.
 *        Default 1 gives a triangle wave (no curve, just linear interpolation)
 *        (0-1) gives a curve that spends more time above halfway than below it.
 *        (1+) gives a curve that spends more time below halfway than above it
 *             (like a repeated y=x*x curve)
 *        May not work well for certain values of curve - make sure to test!
 * @param {number} [min] - Smallest value of oscillation, default 0
 * @param {number} [max] - Largest value of oscillation, default 1
 */
function makeNormalOscillation(period, curve, min, max) {
  curve = utils.valueOr(curve, 1);
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);
  var delta = max - min;
  var coefficient = delta * Math.pow(2 / period, curve);
  var halfPeriod = period / 2;
  return function (t) {
    return min + coefficient * Math.abs(Math.pow((t % period) - halfPeriod, curve));
  };
}
