import {assert} from 'chai';
import pixelmatch from 'pixelmatch';
import {toImageData} from '@cdo/apps/imageUtils';

/**
 * Compares two images using a visual diff function provided by the
 * mapbox/pixelmatch library, which can account for anti-aliasing and
 * has a configurable error threshold.
 *
 * This assertion accepts images in a variety of formats, doing conversions
 * as needed to make test cases more readable.  For example, you could
 * give the URL of a fixture image and a canvas you've been drawing on,
 * and this method will compare them like you'd expect it to.
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement|ImageData} expected
 * @param {string|HTMLImageElement|HTMLCanvasElement|ImageData} actual
 * @param {number} [threshold]
 *   How precise the comparison should be, given in the range [0..1]
 *   where lower is more precise.  Zero checks that the binary image data
 *   is an exact match, which tends to be too brittle for our purposes
 *   because there are subtle differences in how browsers encode images.
 *   Even Chrome and ChromeHeadless give different results at this level
 *   of precision.
 * @returns {Promise} Resolves if the images visually match, rejects with
 *   an assertion error if they do not match.
 */
export default async function assertVisualMatch(
  expected,
  actual,
  threshold = 0.05
) {
  /*
  In order to do the pixel comparison below, we need to coerce both
  expected and actual values to ImageData objects.

  @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
   */
  expected = await toImageData(expected);
  actual = await toImageData(actual);

  /*
  Precondition for the pixel comparison: The images should be the same size.
   */
  assert(
    expected.width === actual.width && expected.height === actual.height,
    `Expected images to visually match, but they are different sizes\n` +
      `Expected: ${expected.width} x ${expected.height}\n` +
      `  Actual: ${actual.width} x ${actual.height}`
  );

  /*
  This library counts the mismatched pixels between two ImageData arrays,
  with the ability to ignore anti-aliasing and set a custom error threshold.

  If you're trying to debug this test, it's possible to generate a visual
  diff of the two images.  See the documentation for details.

  @see https://github.com/mapbox/pixelmatch
  */
  const mismatchedPixels = pixelmatch(
    expected.data,
    actual.data,
    null,
    expected.width,
    expected.height,
    {threshold}
  );
  assert.equal(
    0,
    mismatchedPixels,
    `Expected images to visually match, but they are different by ${mismatchedPixels} pixels`
  );
}
