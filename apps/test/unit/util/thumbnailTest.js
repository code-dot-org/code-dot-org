import {THUMBNAIL_SIZE} from '@cdo/apps/applab/applabThumbnail';
import {createThumbnail} from '@cdo/apps/util/thumbnail';
import {canvasFromImage, dataURIFromURI, imageFromURI} from '@cdo/apps/imageUtils';
import {expect} from '../../util/configuredChai';
import tallPlayspaceImage from './tallPlayspaceImage.png';
import tallPlayspaceThumbnail from './tallPlayspaceThumbnail.png';

describe('createThumbnail', () => {
  it('creates center-crop thumbnail from tall rectangular image', done => {
    dataURIFromURI(tallPlayspaceThumbnail).then(expectedDataURI => {
      imageFromURI(tallPlayspaceImage).then(image => {
        const canvas = canvasFromImage(image);
        const thumbnailCanvas = createThumbnail(canvas, THUMBNAIL_SIZE);
        const actualDataURI = thumbnailCanvas.toDataURL();
        expect(actualDataURI).to.equal(expectedDataURI);
        done();
      });
    });
  });
});
