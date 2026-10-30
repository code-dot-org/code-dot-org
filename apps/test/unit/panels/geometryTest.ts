import {
  PANEL_ASPECT_RATIO,
  PANEL_CONTROLS_HEIGHT,
  PANEL_HORIZONTAL_MARGIN,
  PANEL_VERTICAL_MARGIN,
  fitPanel,
} from '@cdo/apps/panels/geometry';

describe('fitPanel', () => {
  const sideMargins = PANEL_HORIZONTAL_MARGIN * 2;
  const vertical = PANEL_VERTICAL_MARGIN * 2 + PANEL_CONTROLS_HEIGHT;

  it('fills the width of a tall host', () => {
    const {width, height} = fitPanel(800 + sideMargins, 2000);
    expect(width).toBe(800);
    expect(height).toBeCloseTo(800 / PANEL_ASPECT_RATIO);
  });

  it('fills the height of a wide host, above the controls row', () => {
    const {width, height} = fitPanel(4000, 450 + vertical);
    expect(height).toBe(450);
    expect(width).toBeCloseTo(450 * PANEL_ASPECT_RATIO);
  });
});
