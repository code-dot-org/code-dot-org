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

require('../utils');

var SVG_NS = "http://www.w3.org/2000/svg";

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
var ImageFilter = module.exports = function (svg) {
  /** @private {SVGSVGElement} */
  this.svg_ = svg;

  /** @private {string} */
  this.id_ = 'image-filter-' + uniqueId++;
};

/**
 * Get the `id` attribute of the `filter` element, which is used to reference
 * the filter when applying it to an element.
 * @returns {string}
 */
ImageFilter.prototype.getFilterId = function () {
  return this.id_;
};

ImageFilter.prototype.createInDom = function () {
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
 * Increases the brightness of the image up to pure white (still respecting
 * the alpha channel) then decreases it back to normal.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
ImageFilter.Pulse = function (svg) {
  ImageFilter.call(this, svg);

};
ImageFilter.Pulse.inherits(ImageFilter);

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
ImageFilter.Pulse.prototype.createFilterSteps_ = function () {
  // Only one step in this filter: Increase brightness of all channels to 100%.
  //
  // <feComponentTransfer>
  //   <feFuncR type="linear" slope="1" intercept="0"/>
  //   <feFuncG type="linear" slope="1" intercept="0"/>
  //   <feFuncB type="linear" slope="1" intercept="0"/>
  // </feComponentTransfer>

  // TODO: Replace this SMIL animation with a JS-driven one.
  var brightnessAnimation = document.createElementNS(SVG_NS, 'animate');
  brightnessAnimation.setAttribute('attributeName', 'intercept');
  // This can be adjusted to change the curve of the pulse.
  brightnessAnimation.setAttribute('values', '0;0;0;0.1;0.25;1;0.25;0.1;0;0;0');
  brightnessAnimation.setAttribute('dur', '2s');
  brightnessAnimation.setAttribute('repeatCount', 'indefinite');

  var feComponentTransfer = document.createElementNS(SVG_NS, 'feComponentTransfer');
  var feFuncR = document.createElementNS(SVG_NS, 'feFuncR');
  var feFuncG = document.createElementNS(SVG_NS, 'feFuncG');
  var feFuncB = document.createElementNS(SVG_NS, 'feFuncB');
  [feFuncR, feFuncG, feFuncB].forEach(function (feFunc) {
    feFunc.setAttribute('type', 'linear');
    feFunc.setAttribute('slope', '1');
    feFunc.setAttribute('intercept', '1');
    feFunc.appendChild(brightnessAnimation.cloneNode());
    feComponentTransfer.appendChild(feFunc);
  });

  return [feComponentTransfer];
};
