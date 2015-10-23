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
  this.id_ = null;
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
  // Generate an ID
  this.id_ = 'image-filter-' + uniqueId++;

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
  // <filter id="pulse-filter">
  //  <feComponentTransfer>
  //   <feFuncR type="linear" slope="1" intercept="0"/>
  //   <feFuncG type="linear" slope="1" intercept="0"/>
  //   <feFuncB type="linear" slope="1" intercept="0"/>
  //  </feComponentTransfer>
  // </filter>
  var feComponentTransfer = document.createElementNS(SVG_NS, 'feComponentTransfer');
  var brightnessAnimation = document.createElementNS(SVG_NS, 'animate');
  brightnessAnimation.setAttribute('attributeName', 'intercept');
  brightnessAnimation.setAttribute('values', '0;0;0;0.1;0.25;1;0.25;0.1;0;0;0');
  brightnessAnimation.setAttribute('dur', '2s');
  brightnessAnimation.setAttribute('repeatCount', 'indefinite');
  var feFuncR = document.createElementNS(SVG_NS, 'feFuncR');
  feFuncR.setAttribute('type', 'linear');
  feFuncR.setAttribute('slope', '1');
  feFuncR.setAttribute('intercept', '1');
  feFuncR.appendChild(brightnessAnimation.cloneNode());
  var feFuncG = document.createElementNS(SVG_NS, 'feFuncG');
  feFuncG.setAttribute('type', 'linear');
  feFuncG.setAttribute('slope', '1');
  feFuncG.setAttribute('intercept', '1');
  feFuncG.appendChild(brightnessAnimation.cloneNode());
  var feFuncB = document.createElementNS(SVG_NS, 'feFuncB');
  feFuncB.setAttribute('type', 'linear');
  feFuncB.setAttribute('slope', '1');
  feFuncB.setAttribute('intercept', '1');
  feFuncB.appendChild(brightnessAnimation.cloneNode());
  feComponentTransfer.appendChild(feFuncR);
  feComponentTransfer.appendChild(feFuncG);
  feComponentTransfer.appendChild(feFuncB);
  return [feComponentTransfer];
};
