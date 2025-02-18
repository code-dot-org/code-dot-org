import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TooltipOverlay, {
  textProvider,
  coordinatesProvider,
  styles,
  TEXT_RECT_WIDTH,
  TEXT_RECT_HEIGHT,
  TEXT_RECT_RADIUS,
  BETWEEN_RECT_MARGIN,
} from '@cdo/apps/templates/TooltipOverlay';

describe('TooltipOverlay', () => {
  const TEST_APP_WIDTH = 300,
    TEST_APP_HEIGHT = 200;
  const FAKE_TOOLTIP_TEXT = 'fake-text';
  const FAKE_TOOLTIP_PROVIDER = textProvider(FAKE_TOOLTIP_TEXT);

  it('renders null if mouse is out of bounds', () => {
    expect(
      shallowRender(-1, 0, [FAKE_TOOLTIP_PROVIDER]).find('.tooltip-overlay')
    ).toHaveLength(0);
    expect(
      shallowRender(0, -1, [FAKE_TOOLTIP_PROVIDER]).find('.tooltip-overlay')
    ).toHaveLength(0);
    expect(
      shallowRender(TEST_APP_WIDTH + 1, TEST_APP_HEIGHT, [
        FAKE_TOOLTIP_PROVIDER,
      ]).find('.tooltip-overlay')
    ).toHaveLength(0);
    expect(
      shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT + 1, [
        FAKE_TOOLTIP_PROVIDER,
      ]).find('.tooltip-overlay')
    ).toHaveLength(0);
  });

  it('renders null if no providers are given', () => {
    expect(shallowRender(0, 0, null).find('.tooltip-overlay')).toHaveLength(0);
    expect(shallowRender(0, 0, []).find('.tooltip-overlay')).toHaveLength(0);
  });

  it('renders tooltip if mouse is in bounds', () => {
    expect(
      shallowRender(0, 0, [FAKE_TOOLTIP_PROVIDER]).find('.tooltip-overlay')
    ).toHaveLength(1);
    expect(
      shallowRender(TEST_APP_WIDTH, 0, [FAKE_TOOLTIP_PROVIDER]).find(
        '.tooltip-overlay'
      )
    ).toHaveLength(1);
    expect(
      shallowRender(0, TEST_APP_HEIGHT, [FAKE_TOOLTIP_PROVIDER]).find(
        '.tooltip-overlay'
      )
    ).toHaveLength(1);
    expect(
      shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT, [
        FAKE_TOOLTIP_PROVIDER,
      ]).find('.tooltip-overlay')
    ).toHaveLength(1);
  });

  it('renders as a group of groups, each containing text and a rectangle', () => {
    const tooltip = shallowRender(0, 0, [
      textProvider('one'),
      textProvider('two'),
    ]);
    const EXPECTED_X = 6;
    validateRect(tooltip.find('rect').first(), EXPECTED_X, 6);
    validateRect(tooltip.find('rect').last(), EXPECTED_X, 31);
    validateText(tooltip.find('text').first(), EXPECTED_X, 6, 'one');
    validateText(tooltip.find('text').last(), EXPECTED_X, 31, 'two');
  });

  it('renders above and left of cursor when cursor near lower-right boundary', () => {
    const tooltip = shallowRender(TEST_APP_WIDTH, TEST_APP_HEIGHT, [
      textProvider('one'),
      textProvider('two'),
    ]);
    const EXPECTED_X = 185;
    validateRect(tooltip.find('rect').first(), EXPECTED_X, 148);
    validateRect(tooltip.find('rect').last(), EXPECTED_X, 173);
    validateText(tooltip.find('text').first(), EXPECTED_X, 148, 'one');
    validateText(tooltip.find('text').last(), EXPECTED_X, 173, 'two');
  });

  it('generates a set of tooltip strings from providers that return a string', () => {
    expect(withProviders([]).instance().getTooltipStrings()).toHaveLength(0);

    expect(
      withProviders([() => '', () => null, () => null])
        .instance()
        .getTooltipStrings().length
    ).toBe(1);

    expect(
      withProviders([() => 'one', () => 'two', () => 'three'])
        .instance()
        .getTooltipStrings().length
    ).toBe(3);
  });

  it('generates tooltip dimensions that depend on the length of the string set', () => {
    expect(withStrings([]).instance().getTooltipDimensions()).toEqual({
      width: TEXT_RECT_WIDTH,
      height: 0,
    });

    expect(withStrings(['one']).instance().getTooltipDimensions()).toEqual({
      width: TEXT_RECT_WIDTH,
      height: TEXT_RECT_HEIGHT,
    });

    expect(
      withStrings(['one', 'two']).instance().getTooltipDimensions()
    ).toEqual({
      width: TEXT_RECT_WIDTH,
      height: 2 * TEXT_RECT_HEIGHT + BETWEEN_RECT_MARGIN,
    });

    expect(
      withStrings(['one', 'two', 'three']).instance().getTooltipDimensions()
    ).toEqual({
      width: TEXT_RECT_WIDTH,
      height: 3 * TEXT_RECT_HEIGHT + 2 * BETWEEN_RECT_MARGIN,
    });
  });

  describe('coordinatesProvider', function () {
    it('maps props mouseX and mouseY to a coordinate string', function () {
      const props = {
        mouseX: 50,
        mouseY: 100,
      };
      expect(coordinatesProvider()(props)).toBe(
        `x: ${props.mouseX}, y: ${props.mouseY}`
      );
    });

    it('rounds the given coordinates', function () {
      const props = {
        mouseX: 1.3,
        mouseY: 2.9,
      };
      expect(coordinatesProvider()(props)).toBe('x: 1, y: 3');
    });
    it('reverse the direction of the coordinates in a RTL language', function () {
      const props = {
        mouseX: 50,
        mouseY: 100,
      };
      const isRtl = true;
      expect(coordinatesProvider(false, isRtl)(props)).toBe(
        `\u202A${props.mouseY} :y, ${props.mouseX} :x\u202C`
      );
    });
  });

  function shallowRender(x, y, providers = [], above = false) {
    return shallow(
      <TooltipOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={x}
        mouseY={y}
        providers={providers}
        tooltipAboveCursor={above}
      />
    );
  }

  function withProviders(providers) {
    return mount(
      <TooltipOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        mouseX={0}
        mouseY={0}
        providers={providers}
      />
    );
  }

  function withStrings(strings) {
    return withProviders(strings.map(textProvider));
  }

  function validateRect(rectElement, x, y) {
    const rectProps = rectElement.props();
    expect(rectElement).toHaveLength(1);
    expect(rectProps.x).toBe(x);
    expect(rectProps.y).toBe(y);
    expect(rectProps.width).toBe(TEXT_RECT_WIDTH);
    expect(rectProps.height).toBe(TEXT_RECT_HEIGHT);
    expect(rectProps.rx).toBe(TEXT_RECT_RADIUS);
    expect(rectProps.ry).toBe(TEXT_RECT_RADIUS);
    expect(rectProps.style).toBe(styles.rect);
  }

  function validateText(textElement, x, y, displayText) {
    const textProps = textElement.props();
    expect(textElement).toHaveLength(1);
    expect(textProps.x).toBe(x + 55);
    expect(textProps.y).toBe(y + 14);
    expect(textProps.style).toBe(styles.text);
    expect(textElement.text()).toBe(displayText);
  }
});
