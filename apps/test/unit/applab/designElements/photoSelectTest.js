import {expect} from '../../../util/deprecatedChai';
import label from '@cdo/apps/applab/designElements/label';
import library from '@cdo/apps/applab/designElements/library';

function getRect(e) {
  return {
    left: parseInt(e.style.left, 10),
    top: parseInt(e.style.top, 10),
    width: parseInt(e.style.width, 10),
    height: parseInt(e.style.height, 10)
  };
}

function setFontSize(e, newFontSize) {
  const before = label.beforePropertyChange(e, 'fontSize');
  e.style.fontSize = newFontSize + 'px';
  label.onPropertyChange(e, 'fontSize', newFontSize, before);
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
    setFontSize(e, 5);
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('increasing font size does not change size to fit', () => {
    const oldRect = getRect(e);
    setFontSize(e, 100);
    expect(getRect(e)).to.deep.equal(oldRect);
  });
});
