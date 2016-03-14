/** @file Increases the brightness of the image up to pure white and back. */
'use strict';

require('../utils');
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
  this.curve_ = ImageFilter.makeBellCurveOscillation(2000, 2, 0, 0.5);
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
