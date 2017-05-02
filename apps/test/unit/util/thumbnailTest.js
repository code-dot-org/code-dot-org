import {createThumbnail} from '@cdo/apps/util/thumbnail';
import {canvasFromImage, dataURIFromURI, imageFromURI} from '@cdo/apps/imageUtils';
import {expect} from '../../util/configuredChai';
import squarePlayspaceImage from './squarePlayspaceImage.png';
import squarePlayspaceThumbnail from './squarePlayspaceThumbnail.png';
import tallPlayspaceImage from './tallPlayspaceImage.png';
import tallPlayspaceThumbnail from './tallPlayspaceThumbnail.png';

describe('createThumbnail', () => {
  it('creates a square thumbnail from a square image', done => {
    dataURIFromURI(squarePlayspaceThumbnail).then(expectedDataURI => {
      imageFromURI(squarePlayspaceImage).then(image => {
        const canvas = canvasFromImage(image);
        const thumbnailCanvas = createThumbnail(canvas);
        const actualDataURI = thumbnailCanvas.toDataURL();
        expect(actualDataURI).to.equal(expectedDataURI);
        done();
      });
    });
  });

  it('creates square center-crop thumbnail from tall rectangular image', done => {
    dataURIFromURI(tallPlayspaceThumbnail).then(expectedDataURI => {
      imageFromURI(tallPlayspaceImage).then(image => {
        const canvas = canvasFromImage(image);
        const thumbnailCanvas = createThumbnail(canvas);
        const actualDataURI = thumbnailCanvas.toDataURL();
        expect(actualDataURI).to.equal(expectedDataURI);
        done();
      });
    });
  });
});
