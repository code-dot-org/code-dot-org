/** @file Wrapper for an SVG filter definition with animation capabilities */
'use strict';

var SVG_NS = require('../constants').SVG_NS;
var utils = require('../utils');

// Unique element ID that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * Base class for defining complex SVG <filter>s that can be applied to
 * any number of elements in playlab, but are primarily designed for use with
 * image/sprite elements.
 *
 * The filter behaviors are defined here in code, but are added dynamically to
 * the DOM as late as possible to avoid adding them when they are not needed.
 *
 * Wrapping the filters this way also provides an easy place to dynamically
 * manipulate their properties, generating filter animation.
 *
 * @constructor
 * @param {!SVGSVGElement} svg - Every filter must belong to a single SVG
 *        root element, because it gets defined inside that SVG's defs tag.
 *        Note: The filter is not created right away, but we hold the SVG
 *        reference so we can late-create the filter when it's needed.
 */
var ImageFilter = function (svg) {
  /** @private {SVGSVGElement} */
  this.svg_ = svg;

  /** @private {string} */
  this.id_ = 'image-filter-' + uniqueId++;

  /** @private {number} how many elements are currently using this filter. */
  this.applyCount_ = 0;

  /** @private {?} setInterval key */
  this.intervalId_ = null;

};
module.exports = ImageFilter;

/**
 * Set the passed element to use this filter (replaces other filters it may
 * be using.)
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.applyTo = function (svgElement) {
  if (!this.checkBrowserSupport_()) {
    return;
  }

  if (this.applyCount_ === 0) {
    this.createInDom_();
  }
  svgElement.setAttribute('filter', 'url("#' + this.id_ + '")');
  this.applyCount_++;
};

/**
 * If the passed element is using this filter, removes the filter.
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.removeFrom = function (svgElement) {
  // Different browsers clean the filter attribute differently
  // This matches
  //   url(#filter-id)
  //   url("#filter-id")
  var regex = new RegExp("url\\([\"']?#" + this.id_ + "[\"']?\\)", 'i');
  if (regex.test(svgElement.getAttribute('filter'))) {
    svgElement.removeAttribute('filter');
    this.applyCount_--;
  }
  if (this.applyCount_ === 0) {
    this.removeFromDom_();
  }
};

/**
 * Update this effect's animation for the current time.
 * Called by effect's own interval (not Studio.onTick) so that we can run
 * effects even when the studio simulation is not running.
 * @param {number} timeMs
 */
ImageFilter.prototype.update = function (timeMs) {
  // No default operation here.  Subclasses may override this to implement
  // animation.
};

/**
 * Generates the necessary elements and adds this filter to the parent SVG
 * under the <defs> tag.
 * @private
 */
ImageFilter.prototype.createInDom_ = function () {
  var filter = document.getElementById(this.id_);
  if (filter) {
    return;
  }

  // Make a new filter element
  filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', this.id_);

  // Add the filter steps (expected to be different for each filter type)
  var steps = this.createFilterSteps_();
  steps.forEach(function (step) {
    filter.appendChild(step);
  });

  // Put the filter in the SVG Defs node.
  var defs = this.getDefsNode_();
  defs.appendChild(filter);

  // Establish 30FPS update interval
  if (!this.intervalId_) {
    this.intervalId_ = window.setInterval(function () {
      this.update(new Date().getTime());
    }.bind(this), 1000/30);
  }
};

/**
 * Removes this SVG filter from the <defs> tag.
 * @private
 */
ImageFilter.prototype.removeFromDom_ = function () {
  if (this.intervalId_) {
    window.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }

  var filter = document.getElementById(this.id_);
  if (filter) {
    filter.parentNode.removeChild(filter);
  }
};

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 */
ImageFilter.prototype.createFilterSteps_ = function () {
  return [];
};

/**
 * Get the Defs tag for our SVG, creating it if it doesn't exist.
 * @returns {SVGDefsElement}
 * @private
 */
ImageFilter.prototype.getDefsNode_ = function () {
  var defs = this.svg_.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    this.svg_.appendChild(defs);
  }
  return defs;
};

/**
 * Check whether the current browser is likely to support SVG filter effects.
 * Can be overridden by subclasses needing specific support.
 * @returns {boolean}
 * @private
 */
ImageFilter.prototype.checkBrowserSupport_ = function () {
  // Disable filter effects in Safari right now, since they seem to take a
  // long time to render and often cause issues.
  // Chrome also contains 'Safari' in its user agent string, so check for
  // 'Safari' but not 'Chrome'
  // See http://stackoverflow.com/a/7768006/5000129
  if (navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1) {
    return false;
  }

  // Check suggested by http://stackoverflow.com/a/9771153/5000129
  return typeof window.SVGFEColorMatrixElement !== 'undefined' &&
      SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;
};

/**
 * Generates a function that given a time value "t" will produce a number
 * between zero and one (inclusive) following a given curve between them.
 *
 * @param {number} period - the t-value for one complete cycle, from max to
 *        min and back to max.  Must be nonzero.
 * @param {number} [exponent] - Determines the sharpness of the curve in the
 *        oscillation.
 *        2 (default) gives a traditional bell curve.
 *        1 gives a triangle wave (no curve, just linear interpolation).
 *        0-1 gives a curve that spends more time above halfway than below it.
 *        1+ gives a curve that spends more time below halfway than above it
 *             (like a repeated y=x*x curve).
 *        May not work well for certain values of curve - make sure to test!
 * @param {number} [min] - Smallest value of oscillation, default 0
 * @param {number} [max] - Largest value of oscillation, default 1
 */
ImageFilter.makeBellCurveOscillation = function (period, exponent, min, max) {
  exponent = utils.valueOr(exponent, 2);
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);
  var delta = max - min;
  var coefficient = delta * Math.pow(2 / period, exponent);
  var halfPeriod = period / 2;
  return function (t) {
    return min + coefficient * Math.abs(Math.pow((t % period) - halfPeriod, exponent));
  };
};

/**
 * Generates a function for a repeating pattern as follows:
 *  * Spend the first 1/3 of the period at {min}
 *  * Spend the second 1/3 of the period doing a linear interpolation from
 *    {min} to {max}
 *  * Spend the final 1/3 of the period at {max}
 *
 * @param {number} period - time units before this pattern repeats
 * @param {number} [min] - Lowest value, default zero
 * @param {number} [max] - Highest value, default one
 */
ImageFilter.makeRepeatingOneThirdLinearInterpolation = function (period, min, max) {
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);

  var slope = 3 * (max - min) / period;
  var intercept = 2 * min - max;
  return function (t) {
    return Math.min(max, Math.max(min, slope * (t % period) + intercept));
  };
};
