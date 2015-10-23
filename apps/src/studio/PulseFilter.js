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

require('../utils');
var ImageFilter = require('./ImageFilter');

var SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Increases the brightness of the image up to pure white (still respecting
 * the alpha channel) then decreases it back to normal.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var PulseFilter = function (svg) {
  ImageFilter.call(this, svg);
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
