import {
  dataURIToBlob,
  dataURIToFramedBlob,
  toCanvas,
  toImage,
  toImageData
} from '@cdo/apps/imageUtils';
import {assert} from 'chai';
import expectedPng from './expected.png';
import assertVisualMatch from '../../util/assertVisualMatch';

const TEST_DATA_URI =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="1000"/></svg>';

describe('image utils', () => {
  it('overlays an image inside the Artist frame', done => {
    dataURIToFramedBlob(TEST_DATA_URI, actual => {
      assertVisualMatch(expectedPng, actual)
        .then(done)
        .catch(done);
    });
  });

  describe('toImage', () => {
    it('returns an Image unchanged', async () => {
      const image = await toImage(expectedPng);
      assert.instanceOf(image, HTMLImageElement);
      const result = await toImage(image);
      assert(image === result);
    });

    it('converts an image URI to an Image', async () => {
      assert.typeOf(expectedPng, 'string');
      const result = await toImage(expectedPng);
      assert.instanceOf(result, HTMLImageElement);
      assertVisualMatch(expectedPng, result);
    });

    it('converts a data URI to an Image', async () => {
      const result = await toImage(TEST_DATA_URI);
      assert.instanceOf(result, HTMLImageElement);
      assertVisualMatch(TEST_DATA_URI, result);
    });

    it('converts a blob to an Image', async () => {
      const blob = await dataURIToBlob(TEST_DATA_URI);
      const result = await toImage(blob);
      assert.instanceOf(result, HTMLImageElement);
      assertVisualMatch(TEST_DATA_URI, result);
    });
  });

  describe('toCanvas', () => {
    it('returns a Canvas unchanged', async () => {
      const canvas = document.createElement('canvas');
      const result = await toCanvas(canvas);
      assert(canvas === result);
    });

    it('converts an image element to a canvas', async () => {
      const image = await toImage(expectedPng);
      const result = await toCanvas(image);
      assert.instanceOf(result, HTMLCanvasElement);
      assertVisualMatch(image, result);
    });

    it('converts an image URI to a canvas', async () => {
      assert.typeOf(expectedPng, 'string');
      const result = await toCanvas(expectedPng);
      assert.instanceOf(result, HTMLCanvasElement);
      assertVisualMatch(expectedPng, result);
    });

    it('converts a data URI to a canvas', async () => {
      const result = await toCanvas(TEST_DATA_URI);
      assert.instanceOf(result, HTMLCanvasElement);
      assertVisualMatch(TEST_DATA_URI, result);
    });

    it('converts a blob to a canvas', async () => {
      const blob = await dataURIToBlob(TEST_DATA_URI);
      const result = await toCanvas(blob);
      assert.instanceOf(result, HTMLCanvasElement);
      assertVisualMatch(TEST_DATA_URI, result);
    });
  });

  describe('toImageData', () => {
    it('returns ImageData unchanged', async () => {
      const imageData = new ImageData(8, 8);
      const result = await toImageData(imageData);
      assert(imageData === result);
    });

    it('converts a canvas to an ImageData object', async () => {
      // Expected Image data: We're going to draw a 4px opaque white square
      // That's represented as a 64-byte image (16 pixels * 4 bytes per pixel)
      // at its maximum value RGBA(255, 255, 255, 255)
      const size = 4;
      const expectedData = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < expectedData.length; i++) {
        expectedData[i] = 0xff;
      }

      // Actual canvas: Make a 4x4 canvas and fill it with a white square
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.rect(0, 0, 4, 4);
      ctx.fill();
      const actual = await toImageData(canvas);

      assert.instanceOf(actual, ImageData);
      assert.equal(canvas.width, actual.width);
      assert.equal(canvas.height, actual.height);
      assert.deepEqual(expectedData, actual.data);
    });

    it('converts an image element to an ImageData object', async () => {
      const image = await toImage(expectedPng);
      const result = await toImageData(image);
      assert.instanceOf(result, ImageData);
      assert.equal(522000, result.data.length);
    });

    it('converts an image URI string to an ImageData object', async () => {
      assert.typeOf(expectedPng, 'string');
      const result = await toImageData(expectedPng);
      assert.instanceOf(result, ImageData);
      assert.equal(522000, result.data.length);
    });

    it('converts a data URI string to an ImageData object', async () => {
      const result = await toImageData(TEST_DATA_URI);
      assert.instanceOf(result, ImageData);
      assert.equal(180000, result.data.length);
    });

    it('converts a blob to an ImageData object', async () => {
      const blob = await dataURIToBlob(TEST_DATA_URI);
      const result = await toImageData(blob);
      assert.instanceOf(result, ImageData);
      assert.equal(180000, result.data.length);
    });
  });
});
