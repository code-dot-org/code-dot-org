import $ from 'jquery';
import {expect} from '../../../util/deprecatedChai';
import label from '@cdo/apps/applab/designElements/label';
import library from '@cdo/apps/applab/designElements/library';
import * as applabConstants from '@cdo/apps/applab/constants';

function getRect(e) {
  return {
    left: parseInt(e.style.left, 10),
    top: parseInt(e.style.top, 10),
    width: parseInt(e.style.width, 10),
    height: parseInt(e.style.height, 10)
  };
}

function setText(e, newText) {
  const before = label.beforePropertyChange(e, 'text');
  e.innerHTML = newText;
  label.onPropertyChange(e, 'text', newText, before);
}

function setFontSize(e, newFontSize) {
  const before = label.beforePropertyChange(e, 'fontSize');
  e.style.fontSize = newFontSize + 'px';
  label.onPropertyChange(e, 'fontSize', newFontSize, before);
}

function expectSameWidth(newRect, oldRect) {
  expect(newRect.top).is.equal(oldRect.top, 'top should be the same');
  expect(newRect.left).is.equal(oldRect.left, 'left should be the same');
  expect(newRect.width).is.equal(oldRect.width, 'width should be the same');
  // Don't care about height, which is why we aren't using deep equals.
}

function expectWider(newRect, oldRect) {
  expect(newRect.top).is.equal(oldRect.top, 'top should be the same');
  expect(newRect.width).is.above(oldRect.width, 'should be wider');
}

function expectWiderAlignLeft(newRect, oldRect) {
  expectWider(newRect, oldRect);
  expect(newRect.left).is.equal(oldRect.left, 'left should be the same');
}

function expectWiderAlignCenter(newRect, oldRect) {
  expectWider(newRect, oldRect);
  expect(newRect.left).is.below(oldRect.left, 'should move left');
  const deltaWidth = newRect.width - oldRect.width;
  expect(newRect.left).is.above(
    oldRect.left - deltaWidth,
    'should not move too far left'
  );
}

function expectWiderAlignRight(newRect, oldRect) {
  expectWider(newRect, oldRect);
  const deltaWidth = newRect.width - oldRect.width;
  expect(newRect.left).is.equal(oldRect.left - deltaWidth, 'should move left');
}

describe('Applab designElements/label component', function() {
  let e;
  const NEW_TEXT = 'longer text';
  const LONG_TEXT =
    'very long text string that is almost certainly guaranteed to wrap the screen width';

  beforeEach(() => {
    e = library.createElement(
      library.ElementType.LABEL,
      50 /* left */,
      40 /* top */,
      true /* withoutId */
    );
  });

  it('changing text changes size to fit', () => {
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('deleting text resizes to 15x15', () => {
    setText(e, '');
    const newRect = getRect(e);
    expect(newRect.width).is.equal(15, 'width should be 15px');
    expect(newRect.height).is.equal(15, 'height should be 15px');
  });

  it('deleting text when locked does not resize', () => {
    const oldRect = getRect(e);
    $(e).data('lock-width', 'LOCKED');
    setText(e, '');
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('changing font size changes size to fit', () => {
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('greatly increasing text length wraps at edge of screen', () => {
    const oldRect = getRect(e);
    setText(e, LONG_TEXT);
    const expectedRect = {
      top: oldRect.top,
      left: oldRect.left,
      width: applabConstants.APP_WIDTH - oldRect.left,
      height: 0 // not used
    };
    expectSameWidth(getRect(e), expectedRect);
  });

  it('changing text while center aligned retains alignment', () => {
    e.style.textAlign = 'center';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignCenter(getRect(e), oldRect);
  });

  it('changing font size while center aligned retains alignment', () => {
    e.style.textAlign = 'center';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignCenter(getRect(e), oldRect);
  });

  it('greatly increasing text length while center aligned wraps to size of screen', () => {
    e.style.textAlign = 'center';
    const oldRect = getRect(e);
    setText(e, LONG_TEXT);
    const expectedRect = {
      top: oldRect.top,
      left: 0,
      width: applabConstants.APP_WIDTH,
      height: 0 // not used
    };
    expectSameWidth(getRect(e), expectedRect);
  });

  it('changing text while right aligned retains alignment', () => {
    e.style.textAlign = 'right';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignRight(getRect(e), oldRect);
  });

  it('changing font size while right aligned retains alignment', () => {
    e.style.textAlign = 'right';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignRight(getRect(e), oldRect);
  });

  it('greatly increasing text length while right aligned wraps to retain alignment', () => {
    e.style.textAlign = 'right';
    const oldRect = getRect(e);
    setText(e, LONG_TEXT);
    const expectedRect = {
      top: oldRect.top,
      left: 0,
      width: oldRect.left + oldRect.width,
      height: 0 // not used
    };
    expectSameWidth(getRect(e), expectedRect);
  });

  it('after resizing, changing text does not change size to fit', () => {
    e.style.width = getRect(e).width + 20 + 'px';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('after resizing, changing font size does not change size to fit', () => {
    e.style.width = getRect(e).width + 20 + 'px';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('after resizing close enough, changing text changes size to fit', () => {
    e.style.width = getRect(e).width + 4 + 'px';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('after resizing close enough, changing font size changes size to fit', () => {
    e.style.width = getRect(e).width + 4 + 'px';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignLeft(getRect(e), oldRect);
  });
});
