import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow, mount} from 'enzyme';
import ProgressTableLevelBubble from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelBubble';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {unitTestExports as cacheExports} from '@cdo/apps/util/CachedElement';
import i18n from '@cdo/locale';
import sinon from 'sinon';
import {
  BubbleSize,
  BubbleShape
} from '@cdo/apps/templates/progress/progressStyles';
import {
  BasicBubble,
  BubbleLink
} from '@cdo/apps/templates/progress/BubbleFactory';

const TITLE = '1';

const defaultProps = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  title: TITLE,
  url: '/foo/bar'
};

const borderColors = {
  [LevelStatus.not_tried]: color.lighter_gray,
  [LevelStatus.attempted]: color.level_perfect,
  [LevelStatus.passed]: color.level_perfect,
  [LevelStatus.perfect]: color.level_perfect
};
const backgroundColors = {
  [LevelStatus.not_tried]: color.level_not_tried,
  [LevelStatus.attempted]: color.level_not_tried,
  [LevelStatus.passed]: color.level_passed,
  [LevelStatus.perfect]: color.level_perfect
};
const assessmentBorders = {
  [LevelStatus.not_tried]: color.lighter_gray,
  [LevelStatus.attempted]: color.level_submitted,
  [LevelStatus.submitted]: color.level_submitted,
  [LevelStatus.completed_assessment]: color.level_submitted,
  [LevelStatus.perfect]: color.level_submitted
};
const assessmentBackgrounds = {
  [LevelStatus.not_tried]: color.level_not_tried,
  [LevelStatus.attempted]: color.level_not_tried,
  [LevelStatus.submitted]: color.level_submitted,
  [LevelStatus.completed_assessment]: color.level_submitted,
  [LevelStatus.perfect]: color.level_submitted
};

/**
 * ProgressTableLevelBubble's primary purpose is to determine the shape, size,
 * style, and cache key for an underlying BasicBubble. Consequently many of our
 * tests need to verify properties of the underlying BasicBubble. However,
 * since what the component actually renders is the cached HTML representation
 * of the BasicBubble, we use a spy to intercept the props used to render the
 * BasicBubble so we can render it here for easier verification.
 */
const renderPropsSpy = sinon
  .createSandbox()
  .spy(ProgressTableLevelBubble.prototype, 'renderBasicBubble');

/**
 * The spy's history is reset before each test so this will give us the first
 * BasicBubble rendered during this test.
 */
function getFirstRenderedBasicBubble(propOverrides = {}) {
  // first we render the bubble we want to test, which will call
  // `renderBasicBubble` in the process
  mount(<ProgressTableLevelBubble {...defaultProps} {...propOverrides} />);

  // next we get the args passed to `renderBasicBubble` to render the bubble
  const shape = renderPropsSpy.args[0][0];
  const size = renderPropsSpy.args[0][1];
  const progressStyle = renderPropsSpy.args[0][2];
  const content = renderPropsSpy.args[0][3];

  // finally we render the `BasicBubble` itself so we can verifty its props
  // (since the underlying `CachedElement` rendered it as raw HTML when
  // rendering the `ProgressTableLevelBubble`)
  return mount(
    <BasicBubble shape={shape} size={size} progressStyle={progressStyle}>
      {content}
    </BasicBubble>
  );
}

/**
 * Helper function to retrieve the style object of a rendered bubble with the
 * provided status and props.
 */
function basicBubbleStyleForStatus(status, propOverrides = {}) {
  const wrapper = getFirstRenderedBasicBubble({
    ...propOverrides,
    levelStatus: status
  });
  return wrapper.childAt(0).props().style;
}

function getCacheSize() {
  return Object.keys(cacheExports.elementsHtmlCache['BasicBubble']).length;
}

describe('ProgressTableLevelBubble', () => {
  beforeEach(() => {
    renderPropsSpy.resetHistory();
    cacheExports.clearElementsCache('BasicBubble');
  });

  after(() => {
    renderPropsSpy.resetHistory();
    cacheExports.clearElementsCache('BasicBubble');
  });

  it('renders a link', () => {
    const wrapper = shallow(<ProgressTableLevelBubble {...defaultProps} />);
    expect(wrapper.find(BubbleLink)).to.have.lengthOf(1);
  });

  it('renders default bubble with circle shape', () => {
    const wrapper = getFirstRenderedBasicBubble();
    expect(wrapper.props().shape).to.equal(BubbleShape.circle);
  });

  it('renders concept bubble with diamond shape', () => {
    const wrapper = getFirstRenderedBasicBubble({isConcept: true});
    expect(wrapper.props().shape).to.equal(BubbleShape.diamond);
  });

  it('renders unplugged bubble with pill shape', () => {
    const wrapper = getFirstRenderedBasicBubble({isUnplugged: true});
    expect(wrapper.props().shape).to.equal(BubbleShape.pill);
  });

  it('shows correct text in unplugged bubble', () => {
    const wrapper = getFirstRenderedBasicBubble({isUnplugged: true});
    expect(wrapper.text()).to.equal(i18n.unpluggedActivity());
  });

  it('shows title in normal bubble', () => {
    const wrapper = getFirstRenderedBasicBubble();
    expect(wrapper.text()).to.equal(TITLE);
  });

  it('shows title in concept bubble', () => {
    const wrapper = getFirstRenderedBasicBubble({isConcept: true});
    expect(wrapper.text()).to.equal(TITLE);
  });

  it('shows title in letter bubble', () => {
    const wrapper = getFirstRenderedBasicBubble({
      bubbleSize: BubbleSize.letter
    });
    expect(wrapper.text()).to.equal(TITLE);
  });

  it('does not show title in dot bubble', () => {
    const wrapper = getFirstRenderedBasicBubble({bubbleSize: BubbleSize.dot});
    expect(wrapper.text()).to.equal('');
  });

  it('shows correct icon when locked', () => {
    const wrapper = getFirstRenderedBasicBubble({
      isLocked: true
    });
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('lock');
  });

  it('shows correct icon for bonus', () => {
    const wrapper = getFirstRenderedBasicBubble({isBonus: true});
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('flag-checkered');
  });

  it('shows correct icon for paired', () => {
    const wrapper = getFirstRenderedBasicBubble({isPaired: true});
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('users');
  });

  it('only shows paired icon for bonus + paired', () => {
    const wrapper = getFirstRenderedBasicBubble({
      isBonus: true,
      isPaired: true
    });
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('users');
  });

  Object.keys(borderColors).forEach(status => {
    it(`shows correct border color for status ${status} - not assessment`, () => {
      const style = basicBubbleStyleForStatus(status);
      expect(style.borderColor).to.equal(borderColors[status]);
    });
  });

  Object.keys(backgroundColors).forEach(status => {
    it(`shows correct background color for status ${status} - not assessment`, () => {
      const style = basicBubbleStyleForStatus(status);
      expect(style.backgroundColor).to.equal(backgroundColors[status]);
    });
  });

  Object.keys(assessmentBorders).forEach(status => {
    it(`shows correct border color for status ${status} - assessment`, () => {
      const style = basicBubbleStyleForStatus(status, {
        levelKind: LevelKind.assessment
      });
      expect(style.borderColor).to.equal(assessmentBorders[status]);
    });
  });

  Object.keys(assessmentBackgrounds).forEach(status => {
    it(`shows correct background color for status ${status} - assessment`, () => {
      const style = basicBubbleStyleForStatus(status, {
        levelKind: LevelKind.assessment
      });
      expect(style.backgroundColor).to.equal(assessmentBackgrounds[status]);
    });
  });

  describe('caching', () => {
    it('renders raw HTML instead of component tree', () => {
      const wrapper = mount(<ProgressTableLevelBubble {...defaultProps} />);
      expect(wrapper.find('div').props().dangerouslySetInnerHTML).to.exist;
    });

    it('only caches one element when rendering two identical bubbles', () => {
      mount(<ProgressTableLevelBubble {...defaultProps} />);
      mount(<ProgressTableLevelBubble {...defaultProps} />);
      expect(renderPropsSpy.calledOnce).to.be.true;
      expect(getCacheSize()).to.equal(1);
    });

    it('caches two elements when rendering two different bubbles', () => {
      mount(<ProgressTableLevelBubble {...defaultProps} />);
      mount(<ProgressTableLevelBubble {...defaultProps} isUnplugged={true} />);
      expect(renderPropsSpy.calledTwice).to.be.true;
      expect(getCacheSize()).to.equal(2);
    });

    it('renders the same cached html for different bubbles that look the same', () => {
      // paired icon overrides title so these two should appear the same
      const wrapperA = mount(
        <ProgressTableLevelBubble {...defaultProps} isPaired={true} />
      );
      const wrapperB = mount(
        <ProgressTableLevelBubble {...defaultProps} title="2" isPaired={true} />
      );
      expect(renderPropsSpy.calledOnce).to.be.true;
      expect(getCacheSize()).to.equal(1);
      expect(
        wrapperA.find('div').props().dangerouslySetInnerHTML.__html
      ).to.equal(wrapperB.find('div').props().dangerouslySetInnerHTML.__html);
    });

    it('only caches one element when rendering same bubbles with different urls', () => {
      mount(<ProgressTableLevelBubble {...defaultProps} />);
      mount(
        <ProgressTableLevelBubble {...defaultProps} url={'/foo/bar/baz'} />
      );
      expect(renderPropsSpy.calledOnce).to.be.true;
      expect(getCacheSize()).to.equal(1);
    });
  });
});
