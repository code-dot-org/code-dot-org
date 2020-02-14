import {
  blobToDataURI,
  dataURIFromURI,
  dataURIToFramedBlob
} from '@cdo/apps/imageUtils';
import {expect} from '../../util/deprecatedChai';
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
});
