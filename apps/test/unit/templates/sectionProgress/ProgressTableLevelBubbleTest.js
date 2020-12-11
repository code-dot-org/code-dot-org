import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ProgressTableLevelBubble from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelBubble';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

const TITLE = '1';

const defaultProps = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  disabled: false,
  title: TITLE,
  url: '/foo/bar'
};

const borderColors = {
  [LevelStatus.locked]: color.lighter_gray,
  [LevelStatus.not_tried]: color.lighter_gray,
  [LevelStatus.attempted]: color.level_perfect,
  [LevelStatus.passed]: color.level_perfect,
  [LevelStatus.perfect]: color.level_perfect
};
const backgroundColors = {
  [LevelStatus.locked]: color.level_not_tried,
  [LevelStatus.not_tried]: color.level_not_tried,
  [LevelStatus.attempted]: color.level_not_tried,
  [LevelStatus.passed]: color.level_passed,
  [LevelStatus.perfect]: color.level_perfect
};
const assessmentBorders = {
  [LevelStatus.locked]: color.lighter_gray,
  [LevelStatus.not_tried]: color.lighter_gray,
  [LevelStatus.attempted]: color.level_submitted,
  [LevelStatus.submitted]: color.level_submitted,
  [LevelStatus.completed_assessment]: color.level_submitted
};
const assessmentBackgrounds = {
  [LevelStatus.locked]: color.level_not_tried,
  [LevelStatus.not_tried]: color.level_not_tried,
  [LevelStatus.attempted]: color.level_not_tried,
  [LevelStatus.submitted]: color.level_submitted,
  [LevelStatus.completed_assessment]: color.level_submitted
};

/**
 * Helper function to retrieve the style object of a rendered bubble with the
 * provided status. We use a "bonus" bubble to make it easy to find the
 * FontAwesome content node. The content is in a positioning container, and the
 * parent of that container is the actual "bubble" node with stylized border
 * and background, so we want the style of the content's grandparent.
 */
function bubbleContainerStyleForStatus(status, propOverrides = {}) {
  const wrapper = shallow(
    <ProgressTableLevelBubble
      {...defaultProps}
      {...propOverrides}
      levelStatus={status}
      bonus={true}
    />
  );
  return wrapper
    .find(FontAwesome)
    .at(0)
    .parents()
    .at(1)
    .props().style;
}

describe('ProgressTableLevelBubble', () => {
  it('renders an anchor tag when enabled', () => {
    const wrapper = shallow(<ProgressTableLevelBubble {...defaultProps} />);
    assert(wrapper.is('a'));
  });

  it('does not render an anchor tag when disabled', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} disabled={true} />
    );
    assert(wrapper.is('div'));
  });

  it('shows correct text in unplugged bubble', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} unplugged={true} />
    );
    assert(wrapper.text().includes(i18n.unpluggedActivity()));
  });

  it('shows title in normal bubble', () => {
    const wrapper = shallow(<ProgressTableLevelBubble {...defaultProps} />);
    assert(wrapper.text().includes(TITLE));
  });

  it('shows title in concept bubble', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} concept={true} />
    );
    assert(wrapper.text().includes(TITLE));
  });

  it('shows title in small bubble', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} smallBubble={true} />
    );
    assert(wrapper.text().includes(TITLE));
  });

  it('shows correct icon when locked', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble
        {...defaultProps}
        levelStatus={LevelStatus.locked}
      />
    );
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('lock');
  });

  it('shows correct icon for bonus', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} bonus={true} />
    );
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('flag-checkered');
  });

  it('shows correct icon for paired', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} paired={true} />
    );
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('users');
  });

  it('only shows paired icon for bonus + paired', () => {
    const wrapper = shallow(
      <ProgressTableLevelBubble {...defaultProps} bonus={true} paired={true} />
    );
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.lengthOf(1);
    expect(icon.at(0).props().icon).to.equal('users');
  });

  it('renders a diamond for concept levels', () => {
    const style = bubbleContainerStyleForStatus(LevelStatus.not_tried, {
      concept: true
    });
    assert.equal(style.transform, 'rotate(45deg)');
  });

  it('shows correct border/background colors for status - not assessment', () => {
    Object.keys(borderColors).forEach(status => {
      const style = bubbleContainerStyleForStatus(status);
      assert.equal(style.borderColor, borderColors[status]);
      assert.equal(style.backgroundColor, backgroundColors[status]);
    });
  });

  it('shows correct border/background colors for status - assessment', () => {
    Object.keys(assessmentBorders).forEach(status => {
      const style = bubbleContainerStyleForStatus(status, {
        levelKind: LevelKind.assessment
      });
      assert.equal(style.borderColor, assessmentBorders[status]);
      assert.equal(style.backgroundColor, assessmentBackgrounds[status]);
    });
  });
});
