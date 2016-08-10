import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import AppLabCrosshairOverlay from '@cdo/apps/applab/AppLabCrosshairOverlay';
import CrosshairOverlay from '@cdo/apps/templates/CrosshairOverlay';
// ES5-style require necessary to stub gridUtils.draggedElementDropPoint
var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('AppLabCrosshairOverlay', () => {
  const TEST_APP_WIDTH = Math.random(),
      TEST_APP_HEIGHT = Math.random(),
      TEST_MOUSE_X = Math.random(),
      TEST_MOUSE_Y = Math.random();
  var renderer, stubDraggedElementDropPoint;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    stubDraggedElementDropPoint = sinon.stub(gridUtils, 'draggedElementDropPoint');
  });

  afterEach(() => {
    stubDraggedElementDropPoint.restore();
  });

  it('renders to CrosshairOverlay with unmodified properties when not dragging', () => {
    stubDraggedElementDropPoint.returns(null);
    renderer.render(
        <AppLabCrosshairOverlay
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={TEST_MOUSE_X}
          mouseY={TEST_MOUSE_Y}
        />
    );
    const result = renderer.getRenderOutput();
    expect(result).to.deep.equal(
        <CrosshairOverlay
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={TEST_MOUSE_X}
          mouseY={TEST_MOUSE_Y}
        />
    );
  });

  it('renders to CrosshairOverlay with overridden mouse coordinates when dragging', () => {
    const dropPointX = 42;
    const dropPointY = 43;
    stubDraggedElementDropPoint.returns({ left: dropPointX, top: dropPointY });
    renderer.render(
        <AppLabCrosshairOverlay
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={TEST_MOUSE_X}
          mouseY={TEST_MOUSE_Y}
        />
    );
    const result = renderer.getRenderOutput();
    expect(result).to.deep.equal(
        <CrosshairOverlay
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={dropPointX}
          mouseY={dropPointY}
        />
    );
  });
});
