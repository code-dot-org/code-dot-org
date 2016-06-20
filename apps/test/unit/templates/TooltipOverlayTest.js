import {expect} from '../../util/configuredChai';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import TooltipOverlay, {
    textProvider,
    coordinatesProvider,
    styles,
    TEXT_RECT_WIDTH,
    TEXT_RECT_HEIGHT,
    TEXT_RECT_RADIUS,
    BETWEEN_RECT_MARGIN
} from '@cdo/apps/templates/TooltipOverlay';
// ES5-style require necessary to stub gridUtils.draggedElementDropPoint
var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('TooltipOverlay', () => {
  const TEST_APP_WIDTH = 300, TEST_APP_HEIGHT = 200;
  const FAKE_TOOLTIP_TEXT = 'fake-text';
  const FAKE_TOOLTIP_PROVIDER = textProvider(FAKE_TOOLTIP_TEXT);

  it('renders null if mouse is out of bounds', () => {
    expect(shallowRender(-1, 0, [FAKE_TOOLTIP_PROVIDER])).to.be.null;
    expect(shallowRender(0, -1, [FAKE_TOOLTIP_PROVIDER])).to.be.null;
    expect(shallowRender(TEST_APP_WIDTH + 1, TEST_APP_HEIGHT, [FAKE_TOOLTIP_PROVIDER])).to.be.null;
    expect(shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT + 1, [FAKE_TOOLTIP_PROVIDER])).to.be.null;
  });

  it('renders null if no providers are given', () => {
    expect(shallowRender(0, 0, null)).to.be.null;
    expect(shallowRender(0, 0, [])).to.be.null;
  });

  it('renders tooltip if mouse is in bounds', () => {
    expect(shallowRender(0, 0, [FAKE_TOOLTIP_PROVIDER])).to.not.be.null;
    expect(shallowRender(TEST_APP_WIDTH, 0, [FAKE_TOOLTIP_PROVIDER])).to.not.be.null;
    expect(shallowRender(0, TEST_APP_HEIGHT, [FAKE_TOOLTIP_PROVIDER])).to.not.be.null;
    expect(shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT, [FAKE_TOOLTIP_PROVIDER])).to.not.be.null;
  });

  it('renders as a group of groups, each containing text and a rectangle', () => {
    expect(shallowRender(0, 0, [textProvider('one'), textProvider('two')]))
        .to.deep.equal(
            <g className="tooltip-overlay">
              <g key={0}>
                <rect
                    x={6}
                    y={6}
                    width={TEXT_RECT_WIDTH}
                    height={TEXT_RECT_HEIGHT}
                    rx={TEXT_RECT_RADIUS}
                    ry={TEXT_RECT_RADIUS}
                    style={styles.rect}
                />
                <text x={61} y={20} style={styles.text}>one</text>
              </g>
              <g key={1}>
                <rect
                    x={6}
                    y={31}
                    width={TEXT_RECT_WIDTH}
                    height={TEXT_RECT_HEIGHT}
                    rx={TEXT_RECT_RADIUS}
                    ry={TEXT_RECT_RADIUS}
                    style={styles.rect}
                />
                <text x={61} y={45} style={styles.text}>two</text>
              </g>
            </g>
        );
  });

  it('renders above and left of cursor when cursor near lower-right boundary', () => {
    const EXPECTED_RECT_X = 185;
    const EXPECTED_TEXT_X = 240;
    expect(shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT, [textProvider('one'), textProvider('two')]))
        .to.deep.equal(
            <g className="tooltip-overlay">
              <g key={0}>
                <rect
                    x={EXPECTED_RECT_X}
                    y={148}
                    width={TEXT_RECT_WIDTH}
                    height={TEXT_RECT_HEIGHT}
                    rx={TEXT_RECT_RADIUS}
                    ry={TEXT_RECT_RADIUS}
                    style={styles.rect}
                />
                <text x={EXPECTED_TEXT_X} y={162} style={styles.text}>one</text>
              </g>
              <g key={1}>
                <rect
                    x={EXPECTED_RECT_X}
                    y={173}
                    width={TEXT_RECT_WIDTH}
                    height={TEXT_RECT_HEIGHT}
                    rx={TEXT_RECT_RADIUS}
                    ry={TEXT_RECT_RADIUS}
                    style={styles.rect}
                />
                <text x={EXPECTED_TEXT_X} y={187} style={styles.text}>two</text>
              </g>
            </g>
        );
    expect(EXPECTED_RECT_X).to.be.below(TEST_APP_WIDTH);
    expect(EXPECTED_TEXT_X).to.be.below(TEST_APP_WIDTH);
    expect(TEST_APP_HEIGHT).to.be.above(187);
  });

  it('generates a set of tooltip strings from providers that return a string', () => {
    expect(withProviders([]).getTooltipStrings()).to.be.empty;

    expect(withProviders([
      () => '',
      () => null,
      () => null
    ]).getTooltipStrings().length).to.equal(1);

    expect(withProviders([
      () => 'one',
      () => 'two',
      () => 'three'
    ]).getTooltipStrings().length).to.equal(3);
  });

  it('generates tooltip dimensions that depend on the length of the string set', () => {
    expect(withStrings([]).getTooltipDimensions()).to.deep.equal({
      width: TEXT_RECT_WIDTH,
      height: 0
    });

    expect(withStrings(['one']).getTooltipDimensions()).to.deep.equal({
      width: TEXT_RECT_WIDTH,
      height: TEXT_RECT_HEIGHT
    });

    expect(withStrings(['one', 'two']).getTooltipDimensions()).to.deep.equal({
      width: TEXT_RECT_WIDTH,
      height: 2 * TEXT_RECT_HEIGHT + BETWEEN_RECT_MARGIN
    });

    expect(withStrings(['one', 'two', 'three']).getTooltipDimensions()).to.deep.equal({
      width: TEXT_RECT_WIDTH,
      height: 3 * TEXT_RECT_HEIGHT + 2 * BETWEEN_RECT_MARGIN
    });
  });

  function shallowRender(x, y, providers=[], above=false) {
    let renderer = ReactTestUtils.createRenderer();
    renderer.render(
        <TooltipOverlay
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            mouseX={x}
            mouseY={y}
            providers={providers}
            tooltipAboveCursor={above}
        />
    );
    return renderer.getRenderOutput();
  }

  function withProviders(providers) {
    return ReactTestUtils.renderIntoDocument(<TooltipOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={0}
        mouseY={0}
        providers={providers}
    />);
  }

  function withStrings(strings) {
    return withProviders(strings.map(textProvider));
  }

  describe('coordinatesProvider', function () {
    it('maps props mouseX and mouseY to a coordinate string', function () {
      const props = {
        mouseX: 50,
        mouseY: 100
      };
      expect(coordinatesProvider()(props)).to.equal(`x: ${props.mouseX}, y: ${props.mouseY}`);
    });

    it('floors the given coordinates', function () {
      const props = {
        mouseX: 1.3,
        mouseY: 2.9
      };
      expect(coordinatesProvider()(props)).to.equal('x: 1, y: 2');
    });
  });
});
