import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BasicBubble,
  BubbleLink,
  BubbleSize,
  BubbleShape,
} from '@cdo/apps/templates/progress/BubbleFactory';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import color from '@cdo/apps/util/color';
import * as utils from '@cdo/apps/utils';
import {LevelStatus, LevelKind} from '@cdo/generated-scripts/sharedConstants';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const defaultProps = {
  level: {
    id: '1',
    levelNumber: 1,
    status: LevelStatus.perfect,
    isLocked: false,
    url: '/foo/bar',
    name: 'level_name',
    progression: 'progression_name',
    progressionDisplayName: 'progression_display_name',
  },
  disabled: false,
};

const fakeSectionId = 123456;

/**
 * Helper function to retrieve the underlying `BasicBubble` of a rendered
 * bubble with the provided status and props.
 */
function getBasicBubble(
  status = LevelStatus.not_tried,
  propOverrides = {},
  levelOverrides = {}
) {
  const props = {
    ...defaultProps,
    ...propOverrides,
    level: {...defaultProps.level, ...levelOverrides, status: status},
  };
  const wrapper = mount(<ProgressBubble {...props} />);
  return wrapper.find(BasicBubble);
}

/**
 * Helper function to retrieve the style object of a rendered bubble with the
 * provided status and props.
 */
function styleForStatus(status, propOverrides = {}, levelOverrides = {}) {
  return getBasicBubble(status, propOverrides, levelOverrides)
    .childAt(0)
    .props().style;
}

describe('ProgressBubble', () => {
  it('renders a link when we have a url', () => {
    const wrapper = shallow(<ProgressBubble {...defaultProps} />);
    expect(wrapper.find(BubbleLink)).to.have.lengthOf(1);
  });

  it('does not render a link when we have no url', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          url: '',
        }}
      />
    );
    expect(wrapper.find(BubbleLink)).to.be.empty;
  });

  it('does not render a link if we are disabled', () => {
    const wrapper = shallow(
      <ProgressBubble {...defaultProps} disabled={true} />
    );
    expect(wrapper.find(BubbleLink)).to.be.empty;
  });

  it('shows letter in bubble when level has a letter', () => {
    const wrapper = mount(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          letter: 'a',
        }}
      />
    );

    expect(wrapper.find(BasicBubble).text()).to.equal('a');
  });

  it('has a green background when we have perfect status and not assessment', () => {
    const style = styleForStatus(LevelStatus.perfect);
    expect(style.backgroundColor).to.equal(color.level_perfect);
  });

  it('has a purple background when level status is LevelStatus.completed_assessment, is an assessment level ', () => {
    const style = styleForStatus(
      LevelStatus.completed_assessment,
      {},
      {kind: LevelKind.assessment}
    );
    expect(style.backgroundColor).to.equal(color.level_submitted);
  });

  it('has green border and white background for in progress level', () => {
    const style = styleForStatus(LevelStatus.attempted);
    expect(style.backgroundColor).to.equal(color.level_not_tried);
    expect(style.borderColor).to.equal(color.level_perfect);
  });

  it('has a green border and light green background for too many blocks level', () => {
    const style = styleForStatus(LevelStatus.passed);
    expect(style.backgroundColor).to.equal(color.level_passed);
    expect(style.borderColor).to.equal(color.level_perfect);
  });

  it('has a purple background for submitted level', () => {
    const style = styleForStatus(
      LevelStatus.submitted,
      {},
      {kind: LevelKind.assessment}
    );
    expect(style.backgroundColor).to.equal(color.level_submitted);
    expect(style.borderColor).to.equal(color.level_submitted);
    expect(style.color).to.equal(color.white);
  });

  it('has a red background for review_rejected', () => {
    const style = styleForStatus(
      LevelStatus.review_rejected,
      {},
      {kind: LevelKind.peer_review}
    );
    expect(style.backgroundColor).to.equal(color.level_review_rejected);
    expect(style.borderColor).to.equal(color.level_review_rejected);
    expect(style.color).to.equal(color.white);
  });

  it('has a green background for review_accepted', () => {
    const style = styleForStatus(
      LevelStatus.review_accepted,
      {},
      {kind: LevelKind.peer_review}
    );
    expect(style.backgroundColor).to.equal(color.level_perfect);
    expect(style.borderColor).to.equal(color.level_perfect);
    expect(style.color).to.equal(color.white);
  });

  it('renders a diamond for concept levels', () => {
    const wrapper = getBasicBubble(
      LevelStatus.not_tried,
      {},
      {isConceptLevel: true}
    );
    expect(wrapper.props().shape).to.equal(BubbleShape.diamond);
  });

  it('renders a small diamond for concept levels when smallBubble is true ', () => {
    const wrapper = getBasicBubble(
      LevelStatus.not_tried,
      {smallBubble: true},
      {isConceptLevel: true}
    );
    expect(wrapper.props().shape).to.equal(BubbleShape.diamond);
    expect(wrapper.props().size).to.equal(BubbleSize.dot);
  });

  it('uses name when specified', () => {
    const wrapper = mount(<ProgressBubble {...defaultProps} />);
    assert.equal(wrapper.find('TooltipWithIcon').props().text, '1. level_name');
  });

  it('uses progression display name when no name is specified', () => {
    const wrapper = mount(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          name: '',
        }}
      />
    );
    assert.equal(
      wrapper.find('TooltipWithIcon').props().text,
      '1. progression_display_name'
    );
  });

  it('uses display name when isSublevel is true', () => {
    const wrapper = mount(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          display_name: 'Display Name',
          name: 'display_name',
          isSublevel: true,
        }}
      />
    );
    assert.equal(
      wrapper.find('TooltipWithIcon').props().text,
      '1. Display Name'
    );
  });

  it('renders a small bubble if smallBubble is true', () => {
    const wrapper = getBasicBubble(LevelStatus.not_tried, {smallBubble: true});
    expect(wrapper.props().size).to.equal(BubbleSize.dot);
  });

  it('shows KeepWorkingBadge if a level has teacher feedback keepWorking and not smallBubble', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        smallBubble={false}
        level={{
          ...defaultProps.level,
          teacherFeedbackReviewState: ReviewStates.keepWorking,
        }}
      />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.keepWorking);
  });

  it('hides KeepWorkingBadge if a level has teacher feedback keepWorking and is smallBubble', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        smallBubble={true}
        level={{
          ...defaultProps.level,
          teacherFeedbackReviewState: ReviewStates.keepWorking,
        }}
      />
    );

    expect(wrapper.find(BubbleBadge)).to.have.lengthOf(0);
  });

  it('shows KeepWorkingBadge instead of AssessmentBadge on assessment level if feedback is keepWorking', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
          teacherFeedbackReviewState: ReviewStates.keepWorking,
        }}
      />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.keepWorking);
  });

  it('shows AssessmentBadge on assessment level', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
        }}
      />
    );
    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.assessment);
  });

  it('does not show AssessmentBadge on bubble on assessment level, if smallBubble is true', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        smallBubble={true}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
        }}
      />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(0);
  });

  it('renders a pill shape for unplugged lessons', () => {
    const wrapper = getBasicBubble(
      LevelStatus.perfect,
      {},
      {isUnplugged: true}
    );
    expect(wrapper.props().shape).to.equal(BubbleShape.pill);
  });

  it('renders a circle shape for unplugged when small', () => {
    const wrapper = getBasicBubble(
      LevelStatus.perfect,
      {smallBubble: true},
      {isUnplugged: true}
    );
    expect(wrapper.props().shape).to.equal(BubbleShape.circle);
    expect(wrapper.props().size).to.equal(BubbleSize.dot);
  });

  describe('href', () => {
    it('links to the level url', () => {
      jest
        .spyOn(utils, 'currentLocation')
        .mockClear()
        .mockReturnValue({search: ''});
      const wrapper = mount(
        <ProgressBubble
          {...defaultProps}
          level={{
            ...defaultProps.level,
            url: '/my/test/url',
          }}
        />
      );
      assert.equal(wrapper.find('a').prop('href'), '/my/test/url');
      utils.currentLocation.mockRestore();
    });

    it('includes the section_id in the queryparams if selectedSectionId is present', () => {
      const wrapper = mount(
        <ProgressBubble {...defaultProps} selectedSectionId={fakeSectionId} />
      );
      assert.include(
        wrapper.find('a').prop('href'),
        `section_id=${fakeSectionId}`
      );
    });

    it('includes the user_id in the queryparams if selectedStudentId is present', () => {
      const wrapper = mount(
        <ProgressBubble
          {...defaultProps}
          selectedSectionId={fakeSectionId}
          selectedStudentId="207"
        />
      );
      assert.include(
        wrapper.find('a').prop('href'),
        `section_id=${fakeSectionId}`
      );
      assert.include(wrapper.find('a').prop('href'), 'user_id=207');
    });

    it('preserves the queryparams of the current location', () => {
      jest
        .spyOn(utils, 'currentLocation')
        .mockClear()
        .mockReturnValue({search: `section_id=${fakeSectionId}&user_id=559`});
      const wrapper = mount(<ProgressBubble {...defaultProps} />);
      const href = wrapper.find('a').prop('href');
      assert.include(href, `section_id=${fakeSectionId}`);
      assert.include(href, 'user_id=559');
      utils.currentLocation.mockRestore();
    });

    it('if queryParam section_id and selectedSectionId are present, selectedSectionId wins', () => {
      jest
        .spyOn(utils, 'currentLocation')
        .mockClear()
        .mockReturnValue({search: 'section_id=212&user_id=559'});
      const wrapper = mount(
        <ProgressBubble {...defaultProps} selectedSectionId={fakeSectionId} />
      );
      const href = wrapper.find('a').prop('href');
      assert.notInclude(href, 'section_id=212');
      assert.include(href, `section_id=${fakeSectionId}`);
      assert.include(href, 'user_id=559');
      utils.currentLocation.mockRestore();
    });
  });

  it('it has a title with the levelNumber in it', () => {
    const wrapper = mount(<ProgressBubble {...defaultProps} />);

    // The 'title' property on an <a> is read out screen readers, so it's important we include
    // contextual information to the user about where the link will lead them.
    expect(wrapper.find('a').prop('title')).to.include(
      defaultProps.level.levelNumber
    );
  });
});
