import {
  blobToDataURI,
  dataURIFromURI,
  dataURIToFramedBlob,
  imageFromURI,
  toImageData
} from '@cdo/apps/imageUtils';
import {assert, expect} from 'chai';
import expectedPhantomPng from './expected-phantom.png';
import expectedChromePng from './expected-chrome.png';

describe('image utils', () => {
  it('overlays an image inside the Artist frame', done => {
    // Chrome and PhantomJS generate PNGs that _look_ the same but are are very different when
    // you examine the files.  For now, we have fixtures for both since we want these tests to
    // pass in both browsers.
    const expectedPng = /PhantomJS/.test(window.navigator.userAgent)
      ? expectedPhantomPng
      : expectedChromePng;
    const dataURI =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="1000"/></svg>';
    dataURIToFramedBlob(dataURI, actual => {
      dataURIFromURI(expectedPng).then(expected => {
        blobToDataURI(actual, actual => {
          expect(expected).to.equal(actual);
          done();
        });
      });
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
      const image = await imageFromURI(expectedChromePng);
      const result = await toImageData(image);
      assert.instanceOf(result, ImageData);
      assert.equal(522000, result.data.length);
    });

    it('converts an image URI string to an ImageData object', async () => {
      assert.typeOf(expectedChromePng, 'string');
      const result = await toImageData(expectedChromePng);
      assert.instanceOf(result, ImageData);
      assert.equal(522000, result.data.length);
    });

    it('converts a data URI string to an ImageData object', async () => {
      const dataURI =
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="1000"/></svg>';
      const result = await toImageData(dataURI);
      assert.instanceOf(result, ImageData);
      assert.equal(180000, result.data.length);
    });
  });
});
