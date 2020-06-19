import {expect} from '../../../util/reconfiguredChai';
import library from '@cdo/apps/applab/designElements/library';

function getRect(photoSelectComponent) {
  return {
    left: parseInt(photoSelectComponent.style.left, 10),
    top: parseInt(photoSelectComponent.style.top, 10),
    width: parseInt(photoSelectComponent.style.width, 10),
    height: parseInt(photoSelectComponent.style.height, 10)
  };
}

describe('Applab designElements/photoSelect component', function() {
  let photoSelectComponent;

  beforeEach(() => {
    photoSelectComponent = library.createElement(
      library.ElementType.PHOTO_SELECT,
      50 /* left */,
      40 /* top */,
      true /* withoutId */
    );
  });

  it('decreasing font size does not change size to fit', () => {
    const oldRect = getRect(photoSelectComponent);
    photoSelectComponent.style.fontSize = 5;
    expect(getRect(photoSelectComponent)).to.deep.equal(oldRect);
  });

  it('increasing font size does not change size to fit', () => {
    const oldRect = getRect(photoSelectComponent);
    photoSelectComponent.style.fontSize = 100;
    expect(getRect(photoSelectComponent)).to.deep.equal(oldRect);
  });
});
