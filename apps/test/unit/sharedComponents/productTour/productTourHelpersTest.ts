import {scrollIntoViewIfNeeded} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

const makeElement = (rect: Partial<DOMRect>): HTMLElement => {
  const el = document.createElement('div');
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
  el.scrollIntoView = jest.fn();
  return el;
};

describe('scrollIntoViewIfNeeded', () => {
  const originalInnerHeight = window.innerHeight;

  const setInnerHeight = (height: number) => {
    Object.defineProperty(window, 'innerHeight', {
      value: height,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    setInnerHeight(768);
  });

  afterEach(() => {
    setInnerHeight(originalInnerHeight);
  });

  it('does not scroll when element is fully visible', () => {
    const el = makeElement({top: 100, bottom: 400});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when element sits exactly at viewport boundaries', () => {
    const el = makeElement({top: 0, bottom: 768});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to center when element top is above the viewport', () => {
    const el = makeElement({top: -50, bottom: 100});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });

  it('scrolls to center when element bottom is below the viewport', () => {
    const el = makeElement({top: 600, bottom: 900});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });

  it('scrolls to center when element is entirely below the viewport', () => {
    const el = makeElement({top: 800, bottom: 1000});
    scrollIntoViewIfNeeded(el);
    expect(el.scrollIntoView).toHaveBeenCalledWith({block: 'center'});
  });
});
