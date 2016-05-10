import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';
import TooltipOverlay, {
    textProvider,
    TEXT_RECT_WIDTH,
    TEXT_RECT_HEIGHT,
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
});
