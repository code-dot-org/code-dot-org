import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
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
    stubDraggedElementDropPoint = sinon.stub(
      gridUtils,
      'draggedElementDropPoint'
    );
  });

  afterEach(() => {
    stubDraggedElementDropPoint.restore();
  });

  it('renders to CrosshairOverlay with unmodified properties when not dragging', () => {
    stubDraggedElementDropPoint.returns(null);
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
    expect(overlay.length).to.equal(1);
    expect(props.width).to.equal(TEST_APP_WIDTH);
    expect(props.height).to.equal(TEST_APP_HEIGHT);
    expect(props.mouseX).to.equal(TEST_MOUSE_X);
    expect(props.mouseY).to.equal(TEST_MOUSE_Y);
  });

  it('renders to CrosshairOverlay with overridden mouse coordinates when dragging', () => {
    const dropPointX = 42;
    const dropPointY = 43;
    stubDraggedElementDropPoint.returns({left: dropPointX, top: dropPointY});
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
    expect(overlay.length).to.equal(1);
    expect(props.width).to.equal(TEST_APP_WIDTH);
    expect(props.height).to.equal(TEST_APP_HEIGHT);
    expect(props.mouseX).to.equal(dropPointX);
    expect(props.mouseY).to.equal(dropPointY);
  });
});
