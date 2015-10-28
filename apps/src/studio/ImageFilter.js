/** @file Wrapper for an SVG filter definition with animation capabilities */
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

var SVG_NS = require('../constants').SVG_NS;

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
 * TODO: SVG filters are not supported in IE9.  This class should do a feature
 *       check and convert itself into a no-op if we detect that filters are
 *       not supported.
 *
 * TODO: Some of these filters are using SVG SMIL animation, which is deprecated
 *       and not supported in any version of Internet Explorer.  They're going
 *       in this way for now to facilitate demo videos.  Those declared
 *       animations need to be replaced by modifying filter attributes in
 *       an 'update' method or on some timer.
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
  if (svgElement.getAttribute('filter') === 'url("#' + this.id_ + '")') {
    svgElement.removeAttribute('filter');
  }
  this.applyCount_--;
  if (this.applyCount_ === 0) {
    this.removeFromDom_();
  }
};

/* jshint unused: false */
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
/* jshint unused: true */

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
