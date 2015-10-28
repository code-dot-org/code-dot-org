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

  /** @private {boolean} Whether this filter is in the DOM ready to use yet. */
  this.addedToDom_ = false;
};
module.exports = ImageFilter;

/**
 * Set the passed element to use this filter (replaces other filters it may
 * be using.)
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.applyTo = function (svgElement) {
  if (!this.addedToDom_) {
    this.createInDom_();
  }
  svgElement.setAttribute('filter', 'url("#' + this.id_ + '")');
};

/**
 * If the passed element is using this filter, removes the filter.
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.removeFrom = function (svgElement) {
  if (svgElement.getAttribute('filter') === 'url("#' + this.id_ + '")') {
    svgElement.removeAttribute('filter');
  }
};

/**
 * Generates the necessary elements and adds this filter to the parent SVG
 * under the <defs> tag.
 * @private
 */
ImageFilter.prototype.createInDom_ = function () {
  if (this.addedToDom_) {
    return;
  }

  // Make a new filter element
  var filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', this.id_);

  // Add the filter steps (expected to be different for each filter type)
  var steps = this.createFilterSteps_();
  steps.forEach(function (step) {
    filter.appendChild(step);
  });

  // Put the filter in the SVG Defs node.
  var defs = this.getDefsNode_();
  defs.appendChild(filter);

  this.addedToDom_ = true;
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
