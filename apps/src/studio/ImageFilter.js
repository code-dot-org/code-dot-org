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

  /** @private {boolean} Whether this filter is in the DOM ready to use yet. */
  this.addedToDom_ = false;
};

/**
 * Set the passed element to use this filter (replaces other filters it may
 * be using.)
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.applyTo = function (svgElement) {
  if (!this.addedToDom_) {
    this.createInDom_();
  }

  svgElement.setAttribute('filter', 'url(#' + this.id_ + ')');
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

/**
 * Runs a specular spotlight across the image from top-left to bottom-right,
 * not hitting alpha'd areas, generating a looping "shine" effect.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
ImageFilter.Shine = function (svg) {
  ImageFilter.call(this, svg);
};
ImageFilter.Shine.inherits(ImageFilter);

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
ImageFilter.Shine.prototype.createFilterSteps_ = function () {
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

/**
 * Adds a white glowing outline to the image.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
ImageFilter.Glow = function (svg) {
  ImageFilter.call(this, svg);
};
ImageFilter.Glow.inherits(ImageFilter);

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
ImageFilter.Glow.prototype.createFilterSteps_ = function () {
  // 1. Flood-fill the glow color (white)
  // 2. Dilate (grow) the source alpha mask
  // 3. Combine to get a silhouette in the correct color
  // 4. Blur the silhouette for a soft glow
  // 5. Mask out the object's original alpha channel
  // 6. Composite the glow and original image, with varying glow alpha

  var feFloodWhite = document.createElementNS(SVG_NS, 'feFlood');
  var feFloodWhiteResult = this.id_ + '-flood-white';
  feFloodWhite.setAttribute('flood-color', 'white');
  feFloodWhite.setAttribute('result', feFloodWhiteResult);

  var feMorphology = document.createElementNS(SVG_NS, 'feMorphology');
  var feMorphologyResult = this.id_ + '-morphology';
  feMorphology.setAttribute('in', 'SourceAlpha');
  feMorphology.setAttribute('operator', 'dilate');
  feMorphology.setAttribute('radius', 2);
  feMorphology.setAttribute('result', feMorphologyResult);

  var feCompositeSilhouette = document.createElementNS(SVG_NS, 'feComposite');
  var feCompositeSilhouetteResult = this.id_ + '-silhouette';
  feCompositeSilhouette.setAttribute('in', feFloodWhiteResult);
  feCompositeSilhouette.setAttribute('operator', 'in');
  feCompositeSilhouette.setAttribute('in2', feMorphologyResult);
  feCompositeSilhouette.setAttribute('result', feCompositeSilhouetteResult);

  var feGaussianBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  var feGaussianBlurResult = this.id_ + '-blur';
  feGaussianBlur.setAttribute('in', feCompositeSilhouetteResult);
  feGaussianBlur.setAttribute('stdDeviation', 2);
  feGaussianBlur.setAttribute('result', feGaussianBlurResult);

  var feCompositeMaskedGlow = document.createElementNS(SVG_NS, 'feComposite');
  var feCompositeMaskedGlowResult = this.id_ + '-masked-glow';
  feCompositeMaskedGlow.setAttribute('in', feGaussianBlurResult);
  feCompositeMaskedGlow.setAttribute('operator', 'out');
  feCompositeMaskedGlow.setAttribute('in2', 'SourceAlpha');
  feCompositeMaskedGlow.setAttribute('result', feCompositeMaskedGlowResult);

  var feCompositeLayers = document.createElementNS(SVG_NS, 'feComposite');
  feCompositeLayers.setAttribute('in', 'SourceGraphic');
  feCompositeLayers.setAttribute('operator', 'arithmetic');
  feCompositeLayers.setAttribute('in2', feCompositeMaskedGlowResult);
  feCompositeLayers.setAttribute('k1', 0);
  feCompositeLayers.setAttribute('k2', 1); // Always show 100% of original image
  feCompositeLayers.setAttribute('k3', 0);
  feCompositeLayers.setAttribute('k4', 0);

  // TODO: Replace this SMIL animation with a JS-driven one
  var glowAnimation = document.createElementNS(SVG_NS, 'animate');
  glowAnimation.setAttribute('attributeName', 'k3');
  glowAnimation.setAttribute('values', [0, 0.2, 1, 0.2, 0].join(';'));
  glowAnimation.setAttribute('dur', '4s');
  glowAnimation.setAttribute('repeatCount', 'indefinite');
  feCompositeLayers.appendChild(glowAnimation);

  return [
      feFloodWhite,
      feMorphology,
      feCompositeSilhouette,
      feGaussianBlur,
      feCompositeMaskedGlow,
      feCompositeLayers
  ];
};
