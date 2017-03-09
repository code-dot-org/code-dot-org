import { dataURIFromURI, dataURIToFramedBlob } from '@cdo/apps/imageUtils';
import {expect} from '../../util/configuredChai';
import expected from './expected.png';

describe('image utils', () => {
  it("overlays an image inside the Artist frame", (done) => {

    // Phantom doesn't support `toBlob`, so return the raw image data instead.
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(this.toDataURL());
    };

    const dataURI = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="1000"/></svg>';
    dataURIToFramedBlob(dataURI, actual => {
      dataURIFromURI(expected).then(expected => {
        dataURIFromURI(actual).then(actual => {
          expect(expected).to.equal(actual);
          done();
        });
      });
    });
  });
});
