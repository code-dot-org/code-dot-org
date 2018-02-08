import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { AppLabTooltipOverlay } from '@cdo/apps/applab/AppLabTooltipOverlay';
import TooltipOverlay from '@cdo/apps/templates/TooltipOverlay';
// ES5-style require necessary to stub gridUtils.draggedElementDropPoint
var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('AppLabTooltipOverlay', () => {
  const TEST_APP_WIDTH = 100 * Math.random(),
      TEST_APP_HEIGHT = 100 * Math.random(),
      TEST_MOUSE_X = 100 * Math.random(),
      TEST_MOUSE_Y = 100 * Math.random(),
      TEST_PROPS = {
        width: TEST_APP_WIDTH,
        height: TEST_APP_HEIGHT,
        mouseX: TEST_MOUSE_X,
        mouseY: TEST_MOUSE_Y,
        isInDesignMode: false
      };
  var renderer, result, stubDraggedElementDropPoint;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    stubDraggedElementDropPoint = sinon.stub(gridUtils, 'draggedElementDropPoint');
  });

  afterEach(() => {
    stubDraggedElementDropPoint.restore();
  });

  describe('when not dragging', () => {
    beforeEach(() => {
      stubDraggedElementDropPoint.returns(null);
      renderer.render(<AppLabTooltipOverlay {...TEST_PROPS} />);
      result = renderer.getRenderOutput();
    });

    it('renders a TooltipOverlay', () => {
      expect(result).to.deep.equal(
          <TooltipOverlay
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            mouseX={TEST_MOUSE_X}
            mouseY={TEST_MOUSE_Y}
            providers={result.props.providers}
            tooltipAboveCursor={false}
          />
      );
    });

    it('renders with unmodified position', () => {
      expect(result.props.mouseX).to.equal(TEST_MOUSE_X);
      expect(result.props.mouseY).to.equal(TEST_MOUSE_Y);
    });

    it('renders tooltip below cursor', () => {
      expect(result.props.tooltipAboveCursor).to.be.false;
    });

    it('always has a provider that returns current coordinate text', () => {
      expect(result.props.providers.length).to.equal(1);
      expect(result.props.providers[0]).to.be.a('function');
      expect(result.props.providers[0](result.props))
          .to.equal(`x: ${Math.floor(TEST_MOUSE_X)}, y: ${Math.floor(TEST_MOUSE_Y)}`);
    });
  });

  describe('when dragging', () => {
    const DROP_POINT_X = 42, DROP_POINT_Y = 43;

    beforeEach(() => {
      stubDraggedElementDropPoint.returns({ left: DROP_POINT_X, top: DROP_POINT_Y });
      renderer.render(<AppLabTooltipOverlay {...TEST_PROPS} />);
      result = renderer.getRenderOutput();
    });

    it('renders with overridden position', () => {
      expect(result.props.mouseX).to.equal(DROP_POINT_X);
      expect(result.props.mouseY).to.equal(DROP_POINT_Y);
    });

    it('renders tooltip above cursor', () => {
      expect(result.props.tooltipAboveCursor).to.be.true;
    });

    it('gives modified position to coordinates provider', () => {
      expect(result.props.providers[0]).to.be.a('function');
      expect(result.props.providers[0](result.props))
          .to.equal(`x: ${Math.floor(DROP_POINT_X)}, y: ${Math.floor(DROP_POINT_Y)}`);
    });
  });

  describe('when over an applab control', () => {
    const CONTROL_ID = 'fake-id';
    const SCREEN_ID = 'screen-id';
    let fakeElement, fakeScreen;

    beforeEach(() => {
      // Create a container for the screen
      let fakeContainer = document.createElement('div');
      fakeContainer.className = 'withCrosshair';

      // Create an element on the screen
      fakeScreen = document.createElement('div');
      fakeScreen.className = 'screen';
      fakeScreen.id = SCREEN_ID;
      fakeContainer.appendChild(fakeScreen);

      fakeElement = document.createElement('div');
      fakeElement.id = CONTROL_ID;
      fakeScreen.appendChild(fakeElement);

    });

    describe('over an applab button', () => {
      beforeEach(() => {
        let instance = ReactTestUtils.renderIntoDocument(<AppLabTooltipOverlay {...TEST_PROPS} />);
        instance.onMouseMove({ target: fakeElement });
        result = ReactTestUtils.findRenderedComponentWithType(instance, TooltipOverlay);
      });

      it('has a second provider that returns the element ID', () => {
        expect(result.props.providers.length).to.equal(2);
        expect(result.props.providers[1]).to.be.a('function');
        expect(result.props.providers[1](result.props)).to.equal(`id: ${CONTROL_ID}`);
      });
    });

    describe('over an applab screen', () => {
      beforeEach(() => {
        let instance = ReactTestUtils.renderIntoDocument(<AppLabTooltipOverlay {...TEST_PROPS} />);
        instance.onMouseMove({ target: fakeScreen });
        result = ReactTestUtils.findRenderedComponentWithType(instance, TooltipOverlay);
      });

      it('has a second provider that returns the screen ID', () => {
        expect(result.props.providers.length).to.equal(2);
        expect(result.props.providers[1]).to.be.a('function');
        expect(result.props.providers[1](result.props)).to.equal(`id: ${SCREEN_ID}`);
      });
    });
  });
});
