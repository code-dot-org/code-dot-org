import {SVG_NS} from './constants';

// Unique element ID that increments by 1 each time an element is created
let uniqueId = 0;

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
 */
class ImageFilter {
  /** The root element */
  protected svg: SVGSVGElement;
  /** Unique id for this filter */
  protected id: string;
  /** How many elements are currently using this filter. */
  protected applyCount: number = 0;
  /** Timer key */
  protected intervalId?: ReturnType<typeof setTimeout>;

  /**
   * @param {!SVGSVGElement} svg - Every filter must belong to a single SVG
   *        root element, because it gets defined inside that SVG's defs tag.
   *        Note: The filter is not created right away, but we hold the SVG
   *        reference so we can late-create the filter when it's needed.
   */
  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.id = `image-filter-${uniqueId}`;
    uniqueId++;
  }

  /**
   * Set the passed element to use this filter (replaces other filters it may
   * be using.)
   * @param svgElement
   */
  applyTo(svgElement: SVGElement) {
    if (!this.checkBrowserSupport()) {
      return;
    }

    if (this.applyCount === 0) {
      this.createInDom();
    }
    svgElement.setAttribute('filter', 'url("#' + this.id + '")');
    this.applyCount++;
  }

  /**
   * If the passed element is using this filter, removes the filter.
   */
  removeFrom(svgElement: SVGElement) {
    // Different browsers clean the filter attribute differently
    // This matches
    //   url(#filter-id)
    //   url("#filter-id")
    const regex = new RegExp('url\\(["\']?#' + this.id + '["\']?\\)', 'i');
    if (regex.test(svgElement.getAttribute('filter') || '')) {
      svgElement.removeAttribute('filter');
      this.applyCount--;
    }

    if (this.applyCount === 0) {
      this.removeFromDom();
    }
  }

  /**
   * Update this effect's animation for the current time.
   * Called by effect's own interval (not Studio.onTick) so that we can run
   * effects even when the studio simulation is not running.
   */
  update(_timeMs: number) {
    // No default operation here.  Subclasses may override this to implement
    // animation.
  }

  /**
   * Generates the necessary elements and adds this filter to the parent SVG
   * under the <defs> tag.
   */
  protected createInDom() {
    let filter = document.getElementById(this.id) as unknown as
      | SVGElement
      | undefined;
    if (filter) {
      return;
    }

    // Make a new filter element
    filter = document.createElementNS(SVG_NS, 'filter') as unknown as
      | SVGElement
      | undefined;
    filter?.setAttribute('id', this.id);

    // Add the filter steps (expected to be different for each filter type)
    const steps = this.createFilterSteps();
    steps.forEach(step => {
      filter?.appendChild(step);
    });

    // Put the filter in the SVG Defs node.
    const defs = this.getDefsNode();
    if (filter) {
      defs.appendChild(filter);
    }

    // Establish 30FPS update interval
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.update(new Date().getTime());
      }, 1000 / 30);
    }
  }

  /**
   * Removes this SVG filter from the <defs> tag.
   */
  protected removeFromDom() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    const filter = document.getElementById(this.id);
    filter?.parentNode?.removeChild(filter);
  }

  /**
   * Build an ordered set of filter operations that define the behavior of this
   * filter type.
   */
  protected createFilterSteps(): SVGElement[] {
    return [];
  }

  /**
   * Get the Defs tag for our SVG, creating it if it doesn't exist.
   */
  protected getDefsNode(): SVGDefsElement {
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      this.svg.appendChild(defs);
    }
    return defs;
  }

  /**
   * Check whether the current browser is likely to support SVG filter effects.
   * Can be overridden by subclasses needing specific support.
   */
  protected checkBrowserSupport(): boolean {
    // Disable filter effects in Safari right now, since they seem to take a
    // long time to render and often cause issues.
    // Chrome also contains 'Safari' in its user agent string, so check for
    // 'Safari' but not 'Chrome'
    // See http://stackoverflow.com/a/7768006/5000129
    if (
      navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1
    ) {
      return false;
    }

    // Check suggested by http://stackoverflow.com/a/9771153/5000129
    return (
      typeof window.SVGFEColorMatrixElement !== 'undefined' &&
      SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2
    );
  }

  /**
   * Generates a function that given a time value "t" will produce a number
   * between zero and one (inclusive) following a given curve between them.
   *
   * @param period - the t-value for one complete cycle, from max to
   *        min and back to max.  Must be nonzero.
   * @param [exponent] - Determines the sharpness of the curve in the
   *        oscillation.
   *        2 (default) gives a traditional bell curve.
   *        1 gives a triangle wave (no curve, just linear interpolation).
   *        0-1 gives a curve that spends more time above halfway than below it.
   *        1+ gives a curve that spends more time below halfway than above it
   *             (like a repeated y=x*x curve).
   *        May not work well for certain values of curve - make sure to test!
   * @param [min] - Smallest value of oscillation, default 0
   * @param [max] - Largest value of oscillation, default 1
   */
  static makeBellCurveOscillation(
    period: number,
    exponent?: number,
    min?: number,
    max?: number,
  ): (t: number) => number {
    exponent = exponent === undefined ? 2 : exponent;
    min = min || 0;
    max = max === undefined ? 1 : max;
    const delta = max - min;
    const coefficient = delta * Math.pow(2 / period, exponent);
    const halfPeriod = period / 2;
    return t =>
      min +
      coefficient * Math.abs(Math.pow((t % period) - halfPeriod, exponent));
  }
}

export default ImageFilter;
