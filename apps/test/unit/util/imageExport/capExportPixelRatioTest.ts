import {capExportPixelRatio} from '@cdo/apps/util/imageExport/capExportPixelRatio';

const IOS_SAFARI_MAX_CANVAS_PIXELS = 4096 * 4096;

describe('capExportPixelRatio', () => {
  it('keeps the requested ratio when the canvas fits', () => {
    expect(capExportPixelRatio(2, 800, 600)).toBe(2);
  });

  it('lowers the ratio until the canvas fits the limit', () => {
    const ratio = capExportPixelRatio(2, 12000, 900);
    expect(ratio).toBeLessThan(2);
    expect(12000 * 900 * ratio ** 2).toBeCloseTo(IOS_SAFARI_MAX_CANVAS_PIXELS);
  });
});
