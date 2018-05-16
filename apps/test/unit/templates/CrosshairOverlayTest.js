import {expect} from '../../util/configuredChai';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import CrosshairOverlay, { CROSSHAIR_MARGIN, styles } from '@cdo/apps/templates/CrosshairOverlay';

describe('CrosshairOverlay', () => {
  const TEST_APP_WIDTH = 300, TEST_APP_HEIGHT = 200;

  function renderAtMousePosition(x, y) {
    let renderer = ReactTestUtils.createRenderer();
    renderer.render(
        <CrosshairOverlay
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={x}
          mouseY={y}
        />
    );
    return renderer.getRenderOutput();
  }

  function checkRenderAtMousePosition(x, y) {
    expect(renderAtMousePosition(x, y)).to.deep.equal(
        <g className="crosshair-overlay">
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={y - CROSSHAIR_MARGIN}
            style={styles.line}
          />
          <line
            x1={0}
            y1={y}
            x2={x - CROSSHAIR_MARGIN}
            y2={y}
            style={styles.line}
          />
        </g>
    );
  }

  it('renders null if mouse is out of bounds', () => {
    expect(renderAtMousePosition(-1, 0)).to.be.null;
    expect(renderAtMousePosition(0, -1)).to.be.null;
    expect(renderAtMousePosition(TEST_APP_WIDTH + 1, TEST_APP_HEIGHT)).to.be.null;
    expect(renderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT + 1)).to.be.null;
  });

  it('renders lines converging at mouse position if mouse is in bounds', () => {
    checkRenderAtMousePosition(0, 0);
    checkRenderAtMousePosition(TEST_APP_WIDTH, 0);
    checkRenderAtMousePosition(0, TEST_APP_HEIGHT);
    checkRenderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT);
  });
});
