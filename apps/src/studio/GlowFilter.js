/** @file Filter that adds a white glowing outline to an image. */
'use strict';

require('../utils'); // Provides Function.prototype.inherits
var color = require('../color');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/**
 * Adds a white glowing outline to the image.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var GlowFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.feCompositeLayers_ = null;

  /** @private {function} */
  this.curve_ = ImageFilter.makeBellCurveOscillation(3000, 3, 0.1, 1.0);
};
GlowFilter.inherits(ImageFilter);
module.exports = GlowFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
GlowFilter.prototype.createFilterSteps_ = function () {
  // 1. Flood-fill the glow color (white)
  // 2. Dilate (grow) the source alpha mask
  // 3. Combine to get a silhouette in the correct color
  // 4. Blur the silhouette for a soft glow
  // 5. Mask out the object's original alpha channel
  // 6. Composite the glow and original image, with varying glow alpha

  var feFloodWhite = document.createElementNS(SVG_NS, 'feFlood');
  var feFloodWhiteResult = this.id_ + '-flood-white';
  feFloodWhite.setAttribute('flood-color', color.white);
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
  feGaussianBlur.setAttribute('stdDeviation', 1);
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
  this.feCompositeLayers_ = feCompositeLayers;

  return [
    feFloodWhite,
    feMorphology,
    feCompositeSilhouette,
    feGaussianBlur,
    feCompositeMaskedGlow,
    feCompositeLayers
  ];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
GlowFilter.prototype.update = function (timeMs) {
  if (this.feCompositeLayers_) {
    this.feCompositeLayers_.setAttribute('k3', this.curve_(timeMs));
  }
};
