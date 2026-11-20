import cdoBlockStyles from '@cdo/apps/blockly/themes/cdoBlockStyles';
import cdoRefreshBlockStyles from '@cdo/apps/blockly/themes/cdoRefreshBlockStyles';

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastWithWhite(hex) {
  return 1.05 / (luminance(hex) + 0.05);
}

describe('cdoRefreshBlockStyles', () => {
  it('defines every style in cdoBlockStyles', () => {
    expect(Object.keys(cdoRefreshBlockStyles).sort()).toEqual(
      Object.keys(cdoBlockStyles).sort()
    );
  });

  Object.entries(cdoRefreshBlockStyles).forEach(([name, style]) => {
    it(`${name} primary meets WCAG AA against white text`, () => {
      expect(contrastWithWhite(style.colourPrimary)).toBeGreaterThanOrEqual(
        4.5
      );
    });
  });
});
