import React from 'react';
import {expect} from '../../util/deprecatedChai';
import {mount} from 'enzyme';
import CrosshairOverlay, {
  CROSSHAIR_MARGIN,
  styles
} from '@cdo/apps/templates/CrosshairOverlay';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../util/throwOnConsole';

describe('CrosshairOverlay', () => {
  allowConsoleErrors();
  allowConsoleWarnings();

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
    expect(crosshairOverlay.find('g')).to.have.length(1);
    expect(crosshairOverlay.find('line')).to.have.length(2);
    const firstLine = crosshairOverlay.find('line').first();
    expect(firstLine.props().x1).to.equal(x);
    expect(firstLine.props().y1).to.equal(0);
    expect(firstLine.props().x2).to.equal(x);
    expect(firstLine.props().y2).to.equal(y - CROSSHAIR_MARGIN);
    expect(firstLine.props().style).to.equal(styles.line);
    const secondLine = crosshairOverlay.find('line').last();
    expect(secondLine.props().x1).to.equal(0);
    expect(secondLine.props().y1).to.equal(y);
    expect(secondLine.props().x2).to.equal(x - CROSSHAIR_MARGIN);
    expect(secondLine.props().y2).to.equal(y);
    expect(secondLine.props().style).to.equal(styles.line);
  }

  it('renders null if mouse is out of bounds', () => {
    expect(renderAtMousePosition(-1, 0).html()).to.be.null;
    expect(renderAtMousePosition(0, -1).html()).to.be.null;
    expect(renderAtMousePosition(TEST_APP_WIDTH + 1, TEST_APP_HEIGHT).html()).to
      .be.null;
    expect(renderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT + 1).html()).to
      .be.null;
  });

  it('renders lines converging at mouse position if mouse is in bounds', () => {
    checkRenderAtMousePosition(0, 0);
    checkRenderAtMousePosition(TEST_APP_WIDTH, 0);
    checkRenderAtMousePosition(0, TEST_APP_HEIGHT);
    checkRenderAtMousePosition(TEST_APP_WIDTH, TEST_APP_HEIGHT);
  });
});
