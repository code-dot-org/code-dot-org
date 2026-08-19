import measureRenderedWidth from '@cdo/apps/code-studio/components/header/measureRenderedWidth';

describe('measureRenderedWidth', () => {
  // jQuery's .width() and offsetWidth both round to a whole pixel, which is the
  // bug this helper exists to avoid: the header clips to the reported width, so
  // a value rounded down cuts into the trailing button's border.
  it('keeps the fraction of a sub-pixel width', () => {
    const element = {getBoundingClientRect: () => ({width: 277.453125})};

    expect(measureRenderedWidth(element)).toBe(277.453125);
  });

  it('reports zero when the element is missing', () => {
    expect(measureRenderedWidth(null)).toBe(0);
    expect(measureRenderedWidth(undefined)).toBe(0);
  });
});
