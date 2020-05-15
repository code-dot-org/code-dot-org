import {expect} from '../../../util/deprecatedChai';
import library from '@cdo/apps/applab/designElements/library';

function getRect(e) {
  return {
    left: parseInt(e.style.left, 10),
    top: parseInt(e.style.top, 10),
    width: parseInt(e.style.width, 10),
    height: parseInt(e.style.height, 10)
  };
}

describe('Applab designElements/photoSelect component', function() {
  let e;

  beforeEach(() => {
    e = library.createElement(
      library.ElementType.PHOTO_SELECT,
      50 /* left */,
      40 /* top */,
      true /* withoutId */
    );
  });

  it('decreasing font size does not change size to fit', () => {
    const oldRect = getRect(e);
    e.style.fontSize = 5;
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('increasing font size does not change size to fit', () => {
    const oldRect = getRect(e);
    e.style.fontSize = 100;
    expect(getRect(e)).to.deep.equal(oldRect);
  });
});
