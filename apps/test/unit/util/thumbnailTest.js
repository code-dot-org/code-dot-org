import {createThumbnail} from '@cdo/apps/util/thumbnail';
import {toCanvas} from '@cdo/apps/imageUtils';
import assertVisualMatch from '../../util/assertVisualMatch';
import squarePlayspaceImage from './squarePlayspaceImage.png';
import squarePlayspaceThumbnail from './squarePlayspaceThumbnail.png';
import tallPlayspaceImage from './tallPlayspaceImage.png';
import tallPlayspaceThumbnail from './tallPlayspaceThumbnail.png';

describe('createThumbnail', () => {
  it('creates a square thumbnail from a square image', async () => {
    const expectedThumbnail = squarePlayspaceThumbnail;
    const fullSizeCanvas = await toCanvas(squarePlayspaceImage);
    const actualThumbnail = createThumbnail(fullSizeCanvas);
    await assertVisualMatch(expectedThumbnail, actualThumbnail);
  });

  it('creates square center-crop thumbnail from tall rectangular image', async () => {
    const expectedThumbnail = tallPlayspaceThumbnail;
    const fullSizeCanvas = await toCanvas(tallPlayspaceImage);
    const actualThumbnail = createThumbnail(fullSizeCanvas);
    await assertVisualMatch(expectedThumbnail, actualThumbnail);
  });
});
