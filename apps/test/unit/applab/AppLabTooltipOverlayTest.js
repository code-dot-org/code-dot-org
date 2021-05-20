import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';
import React from 'react';
import {mount, shallow} from 'enzyme';
import {AppLabTooltipOverlay} from '@cdo/apps/applab/AppLabTooltipOverlay';
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
  var result, stubDraggedElementDropPoint;

  beforeEach(() => {
    stubDraggedElementDropPoint = sinon.stub(
      gridUtils,
      'draggedElementDropPoint'
    );
  });

  afterEach(() => {
    stubDraggedElementDropPoint.restore();
  });

  describe('when not dragging', () => {
    beforeEach(() => {
      stubDraggedElementDropPoint.returns(null);
      result = shallow(<AppLabTooltipOverlay {...TEST_PROPS} />);
    });

    it('renders a TooltipOverlay', () => {
      var props = result.find('TooltipOverlay').props();
      expect(props.width).to.equal(TEST_APP_WIDTH);
      expect(props.height).to.equal(TEST_APP_HEIGHT);
    });

    it('renders with unmodified position', () => {
      var props = result.find('TooltipOverlay').props();
      expect(props.mouseX).to.equal(TEST_MOUSE_X);
      expect(props.mouseY).to.equal(TEST_MOUSE_Y);
    });

    it('renders tooltip below cursor', () => {
      var props = result.find('TooltipOverlay').props();
      expect(props.tooltipAboveCursor).to.equal(false);
    });

    it('always has a provider that returns current coordinate text', () => {
      expect(result.props().providers.length).to.equal(1);
      expect(result.props().providers[0]).to.be.a('function');
      expect(result.props().providers[0](result.props())).to.equal(
        `x: ${Math.round(TEST_MOUSE_X)}, y: ${Math.round(TEST_MOUSE_Y)}`
      );
    });
  });

  describe('when dragging', () => {
    const DROP_POINT_X = 42,
      DROP_POINT_Y = 43;

    beforeEach(() => {
      stubDraggedElementDropPoint.returns({
        left: DROP_POINT_X,
        top: DROP_POINT_Y
      });
      result = shallow(<AppLabTooltipOverlay {...TEST_PROPS} />);
    });

    it('renders with overridden position', () => {
      var props = result.find('TooltipOverlay').props();
      expect(props.mouseX).to.equal(DROP_POINT_X);
      expect(props.mouseY).to.equal(DROP_POINT_Y);
    });

    it('renders tooltip above cursor', () => {
      var props = result.find('TooltipOverlay').props();
      expect(props.tooltipAboveCursor).to.be.true;
    });

    it('gives modified position to coordinates provider', () => {
      expect(result.props().providers[0]).to.be.a('function');
      expect(result.props().providers[0](result.props())).to.equal(
        `x: ${Math.floor(DROP_POINT_X)}, y: ${Math.floor(DROP_POINT_Y)}`
      );
    });
  });

  describe('when over an applab control', () => {
    const CONTROL_ID = 'fake-id';
    const SCREEN_ID = 'screen-id';
    let fakeElement, fakeScreen, fakeContainer;

    beforeEach(() => {
      // Create a container for the screen
      fakeContainer = document.createElement('div');
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
        var appLabTooltipOverlay = mount(
          <AppLabTooltipOverlay {...TEST_PROPS} />
        );
        appLabTooltipOverlay.instance().onMouseMove({target: fakeElement});
        appLabTooltipOverlay.update();
        result = appLabTooltipOverlay.find('TooltipOverlay');
      });

      it('has a second provider that returns the element ID', () => {
        expect(result.props().providers.length).to.equal(2);
        expect(result.props().providers[1]).to.be.a('function');
        expect(result.props().providers[1](result.props)).to.equal(
          `id: ${CONTROL_ID}`
        );
      });
    });

    describe('over an applab screen', () => {
      beforeEach(() => {
        var appLabTooltipOverlay = mount(
          <AppLabTooltipOverlay {...TEST_PROPS} />
        );
        appLabTooltipOverlay.instance().onMouseMove({target: fakeScreen});
        appLabTooltipOverlay.update();
        result = appLabTooltipOverlay.find('TooltipOverlay');
      });

      it('has a second provider that returns the screen ID', () => {
        expect(result.props().providers.length).to.equal(2);
        expect(result.props().providers[1]).to.be.a('function');
        expect(result.props().providers[1](result.props)).to.equal(
          `id: ${SCREEN_ID}`
        );
      });
    });
  });
});
