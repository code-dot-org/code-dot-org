import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AppLabCrosshairOverlay from '@cdo/apps/applab/AppLabCrosshairOverlay';

// ES5-style require necessary to stub gridUtils.draggedElementDropPoint
var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('AppLabCrosshairOverlay', () => {
  const TEST_APP_WIDTH = Math.random(),
    TEST_APP_HEIGHT = Math.random(),
    TEST_MOUSE_X = Math.random(),
    TEST_MOUSE_Y = Math.random();
  var stubDraggedElementDropPoint;

  beforeEach(() => {
    stubDraggedElementDropPoint = jest
      .spyOn(gridUtils, 'draggedElementDropPoint')
      .mockClear()
      .mockImplementation();
  });

  afterEach(() => {
    stubDraggedElementDropPoint.mockRestore();
  });

  it('renders to CrosshairOverlay with unmodified properties when not dragging', () => {
    stubDraggedElementDropPoint.mockReturnValue(null);
    var element = shallow(
      <AppLabCrosshairOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={TEST_MOUSE_X}
        mouseY={TEST_MOUSE_Y}
      />
    );

    var overlay = element.find('CrosshairOverlay');
    var props = overlay.props();
    expect(overlay.length).toBe(1);
    expect(props.width).toBe(TEST_APP_WIDTH);
    expect(props.height).toBe(TEST_APP_HEIGHT);
    expect(props.mouseX).toBe(TEST_MOUSE_X);
    expect(props.mouseY).toBe(TEST_MOUSE_Y);
  });

  it('renders to CrosshairOverlay with overridden mouse coordinates when dragging', () => {
    const dropPointX = 42;
    const dropPointY = 43;
    stubDraggedElementDropPoint.mockReturnValue({
      left: dropPointX,
      top: dropPointY,
    });
    var element = shallow(
      <AppLabCrosshairOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={TEST_MOUSE_X}
        mouseY={TEST_MOUSE_Y}
      />
    );

    var overlay = element.find('CrosshairOverlay');
    var props = overlay.props();
    expect(overlay.length).toBe(1);
    expect(props.width).toBe(TEST_APP_WIDTH);
    expect(props.height).toBe(TEST_APP_HEIGHT);
    expect(props.mouseX).toBe(dropPointX);
    expect(props.mouseY).toBe(dropPointY);
  });
});
