/** @file Filter that adds a white glowing outline to an image. */

import {SVG_NS} from './constants';
import ImageFilter from './ImageFilter';

/**
 * Adds a white glowing outline to the image.
 * @param svg - The SVG element to manipulate
 */
class GlowFilter extends ImageFilter {
  feCompositeLayers?: SVGElement;
  curve: (t: number) => number;

  constructor(svg: SVGSVGElement) {
    super(svg);

    this.curve = ImageFilter.makeBellCurveOscillation(3000, 3, 0.1, 1.0);
  }

  /**
   * Build an ordered set of filter operations that define the behavior of this
   * filter type.
   */
  protected createFilterSteps(): SVGElement[] {
    // 1. Flood-fill the glow color (white)
    // 2. Dilate (grow) the source alpha mask
    // 3. Combine to get a silhouette in the correct color
    // 4. Blur the silhouette for a soft glow
    // 5. Mask out the object's original alpha channel
    // 6. Composite the glow and original image, with varying glow alpha

    const feFloodWhite = document.createElementNS(SVG_NS, 'feFlood');
    const feFloodWhiteResult = this.id + '-flood-white';
    feFloodWhite.setAttribute('flood-color', '#ffffff');
    feFloodWhite.setAttribute('result', feFloodWhiteResult);

    const feMorphology = document.createElementNS(SVG_NS, 'feMorphology');
    const feMorphologyResult = this.id + '-morphology';
    feMorphology.setAttribute('in', 'SourceAlpha');
    feMorphology.setAttribute('operator', 'dilate');
    feMorphology.setAttribute('radius', '2');
    feMorphology.setAttribute('result', feMorphologyResult);

    const feCompositeSilhouette = document.createElementNS(
      SVG_NS,
      'feComposite',
    );
    const feCompositeSilhouetteResult = this.id + '-silhouette';
    feCompositeSilhouette.setAttribute('in', feFloodWhiteResult);
    feCompositeSilhouette.setAttribute('operator', 'in');
    feCompositeSilhouette.setAttribute('in2', feMorphologyResult);
    feCompositeSilhouette.setAttribute('result', feCompositeSilhouetteResult);

    const feGaussianBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    const feGaussianBlurResult = this.id + '-blur';
    feGaussianBlur.setAttribute('in', feCompositeSilhouetteResult);
    feGaussianBlur.setAttribute('stdDeviation', '1');
    feGaussianBlur.setAttribute('result', feGaussianBlurResult);

    const feCompositeMaskedGlow = document.createElementNS(
      SVG_NS,
      'feComposite',
    );
    const feCompositeMaskedGlowResult = this.id + '-masked-glow';
    feCompositeMaskedGlow.setAttribute('in', feGaussianBlurResult);
    feCompositeMaskedGlow.setAttribute('operator', 'out');
    feCompositeMaskedGlow.setAttribute('in2', 'SourceAlpha');
    feCompositeMaskedGlow.setAttribute('result', feCompositeMaskedGlowResult);

    const feCompositeLayers = document.createElementNS(SVG_NS, 'feComposite');
    feCompositeLayers.setAttribute('in', 'SourceGraphic');
    feCompositeLayers.setAttribute('operator', 'arithmetic');
    feCompositeLayers.setAttribute('in2', feCompositeMaskedGlowResult);
    feCompositeLayers.setAttribute('k1', '0');
    feCompositeLayers.setAttribute('k2', '1'); // Always show 100% of original image
    feCompositeLayers.setAttribute('k3', '0');
    feCompositeLayers.setAttribute('k4', '0');
    this.feCompositeLayers = feCompositeLayers;

    return [
      feFloodWhite,
      feMorphology,
      feCompositeSilhouette,
      feGaussianBlur,
      feCompositeMaskedGlow,
      feCompositeLayers,
    ];
  }

  /**
   * Update this effect's animation for the current time.
   */
  update(timeMs: number) {
    this.feCompositeLayers?.setAttribute('k3', this.curve(timeMs).toString());
  }
}

export default GlowFilter;
