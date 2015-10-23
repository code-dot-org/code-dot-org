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

require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/**
 * Runs a specular spotlight across the image from top-left to bottom-right,
 * not hitting alpha'd areas, generating a looping "shine" effect.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var ShineFilter = function (svg) {
  ImageFilter.call(this, svg);
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

  var fePointLight = document.createElementNS(SVG_NS, 'fePointLight');
  var pointLightZ = 200;
  fePointLight.setAttribute('x', 0);
  fePointLight.setAttribute('y', 0);
  fePointLight.setAttribute('z', pointLightZ);

  // TODO: Replace this SMIL animation with a JS-driven one.
  var xPositionAnimation = document.createElementNS(SVG_NS, 'animate');
  xPositionAnimation.setAttribute('attributeName', 'x');
  // TODO: Find a way to not depend on the Studio global.
  var values = [
    -pointLightZ,
    -pointLightZ,
    Studio.MAZE_WIDTH + pointLightZ,
    Studio.MAZE_WIDTH + pointLightZ
  ];
  xPositionAnimation.setAttribute('values', values.join(';'));
  xPositionAnimation.setAttribute('dur', '2s');
  xPositionAnimation.setAttribute('repeatCount', 'indefinite');

  var yPositionAnimation = xPositionAnimation.cloneNode();
  yPositionAnimation.setAttribute('attributeName', 'y');

  fePointLight.appendChild(xPositionAnimation);
  fePointLight.appendChild(yPositionAnimation);

  feSpecularLighting.appendChild(fePointLight);

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
