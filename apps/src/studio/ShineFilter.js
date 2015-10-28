/** @file Runs a specular spotlight across the image from top-left to bottom-right. */
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

/** @const {number} determines "height" of light above play area */
var POINT_LIGHT_Z = 200;

/**
 * Runs a specular spotlight across the image from top-left to bottom-right,
 * not hitting alpha'd areas, generating a looping "shine" effect.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var ShineFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.fePointLight_ = null;

  // TODO: Find a way to not depend on the Studio global.
  /** @private {function} */
  this.curve_ = makeOscillation(2000, -POINT_LIGHT_Z, Studio.MAZE_WIDTH + POINT_LIGHT_Z);
};
ShineFilter.inherits(ImageFilter);
module.exports = ShineFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
ShineFilter.prototype.createFilterSteps_ = function () {
  // 1. Blur the source image to get softer light
  // 2. Generate a specular point light
  // 3. Mask out specular light that doesn't fall atop the original alpha mask.
  // 4. Composite the specular light over the original image

  var feGaussianBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  var blurResult = this.id_ + '-blur';
  feGaussianBlur.setAttribute('stdDeviation', 6);
  feGaussianBlur.setAttribute('result', blurResult);

  var feSpecularLighting = document.createElementNS(SVG_NS, 'feSpecularLighting');
  var specularResult = this.id_ + '-specular';
  feSpecularLighting.setAttribute('in', blurResult);
  feSpecularLighting.setAttribute('specularExponent', 60);
  feSpecularLighting.setAttribute('lighting-color', 'white');
  feSpecularLighting.setAttribute('result', specularResult);

  this.fePointLight_ = document.createElementNS(SVG_NS, 'fePointLight');
  this.fePointLight_.setAttribute('x', 0);
  this.fePointLight_.setAttribute('y', 0);
  this.fePointLight_.setAttribute('z', POINT_LIGHT_Z);
  feSpecularLighting.appendChild(this.fePointLight_);

  var feCompositeMask = document.createElementNS(SVG_NS, 'feComposite');
  var maskedSpecularId = specularResult + '-masked';
  feCompositeMask.setAttribute('in', specularResult);
  feCompositeMask.setAttribute('operator', 'in');
  feCompositeMask.setAttribute('in2', 'SourceAlpha');
  feCompositeMask.setAttribute('result', maskedSpecularId);

  var feCompositeLayer = document.createElementNS(SVG_NS, 'feComposite');
  feCompositeLayer.setAttribute('in', maskedSpecularId);
  feCompositeLayer.setAttribute('operator', 'over');
  feCompositeLayer.setAttribute('in2', 'SourceGraphic');


  return [
    feGaussianBlur,
    feSpecularLighting,
    feCompositeMask,
    feCompositeLayer
  ];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
ShineFilter.prototype.update = function (timeMs) {
  if (this.fePointLight_) {
    var newValue = this.curve_(timeMs);
    this.fePointLight_.setAttribute('x', newValue);
    this.fePointLight_.setAttribute('y', newValue);
  }
};

/**
 * Function for a repeating pattern as follows:
 *  * Spend the first 1/3 of the period at {min}
 *  * Spend the second 1/3 of the period doing a linear interpolation from
 *    {min} to {max}
 *  * Spend the final 1/3 of the period at {max}
 *
 * @param {number} period - time units before this pattern repeats
 * @param {number} [min] - Lowest value, default zero
 * @param {number} [max] - Highest value, default one
 */
function makeOscillation(period, min, max) {
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);

  var slope = 3 * (max - min) / period;
  var intercept = 2 * min - max;
  return function (t) {
    return Math.min(max, Math.max(min, slope * (t % period) + intercept));
  };
}
