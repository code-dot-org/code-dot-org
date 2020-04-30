import {createThumbnail} from '@cdo/apps/util/thumbnail';
import {canvasFromURI, toImageData} from '@cdo/apps/imageUtils';
import {assert} from 'chai';
import squarePlayspaceImage from './squarePlayspaceImage.png';
import squarePlayspaceThumbnail from './squarePlayspaceThumbnail.png';
import tallPlayspaceImage from './tallPlayspaceImage.png';
import tallPlayspaceThumbnail from './tallPlayspaceThumbnail.png';
import pixelmatch from 'pixelmatch';

describe('createThumbnail', () => {
  it('creates a square thumbnail from a square image', async () => {
    const expectedThumbnail = squarePlayspaceThumbnail;
    const fullSizeCanvas = await canvasFromURI(squarePlayspaceImage);
    const actualThumbnail = createThumbnail(fullSizeCanvas);
    await assertVisualMatch(expectedThumbnail, actualThumbnail);
  });

  it('creates square center-crop thumbnail from tall rectangular image', async () => {
    const expectedThumbnail = tallPlayspaceThumbnail;
    const fullSizeCanvas = await canvasFromURI(tallPlayspaceImage);
    const actualThumbnail = createThumbnail(fullSizeCanvas);
    await assertVisualMatch(expectedThumbnail, actualThumbnail);
  });
});

async function assertVisualMatch(expected, actual, threshold = 0.05) {
  /*
  In order to do the pixel comparison below, we need to coerce both
  expected and actual values to ImageData objects.

  @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
   */
  expected = await toImageData(expected);
  actual = await toImageData(actual);

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
    `Expected images to visually match, but they were different by ${mismatchedPixels} pixels`
  );
}
