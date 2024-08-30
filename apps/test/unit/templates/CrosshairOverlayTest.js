import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CrosshairOverlay, {
  CROSSHAIR_MARGIN,
  styles,
} from '@cdo/apps/templates/CrosshairOverlay';

describe('CrosshairOverlay', () => {
  const TEST_APP_WIDTH = 300,
    TEST_APP_HEIGHT = 200;

  function renderAtMousePosition(x, y) {
    const crosshairOverlay = mount(
      <CrosshairOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={x}
        mouseY={y}
      />
    );
    return crosshairOverlay;
  }

  function checkRenderAtMousePosition(x, y) {
    const crosshairOverlay = renderAtMousePosition(x, y);
    expect(crosshairOverlay.find('svg')).toHaveLength(1);
    expect(crosshairOverlay.find('line')).toHaveLength(2);
    const firstLine = crosshairOverlay.find('line').first();
    expect(firstLine.props().x1).toBe(x);
    expect(firstLine.props().y1).toBe(0);
    expect(firstLine.props().x2).toBe(x);
    expect(firstLine.props().y2).toBe(y - CROSSHAIR_MARGIN);
    expect(firstLine.props().style).toBe(styles.line);
    const secondLine = crosshairOverlay.find('line').last();
    expect(secondLine.props().x1).toBe(0);
    expect(secondLine.props().y1).toBe(y);
    expect(secondLine.props().x2).toBe(x - CROSSHAIR_MARGIN);
    expect(secondLine.props().y2).toBe(y);
    expect(secondLine.props().style).toBe(styles.line);
  }

  it('renders null if mouse is out of bounds', () => {
    expect(renderAtMousePosition(-1, 0).html()).toBeNull();
    expect(renderAtMousePosition(0, -1).html()).toBeNull();
    expect(
      renderAtMousePosition(TEST_APP_WIDTH + 1, TEST_APP_HEIGHT).html()
    ).toBeNull();
    expect(
      renderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT + 1).html()
    ).toBeNull();
  });

  it('renders lines converging at mouse position if mouse is in bounds', () => {
    checkRenderAtMousePosition(0, 0);
    checkRenderAtMousePosition(TEST_APP_WIDTH, 0);
    checkRenderAtMousePosition(0, TEST_APP_HEIGHT);
    checkRenderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT);
  });
});
