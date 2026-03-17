import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import * as utils from '@cdo/apps/code-studio/utils';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import {UnconnectedProgressPill as ProgressPill} from '@cdo/apps/templates/progress/ProgressPill';
import {LevelStatus, LevelKind} from '@cdo/generated-scripts/sharedConstants';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const unpluggedLevel = {
  id: '1',
  kind: LevelKind.unplugged,
  isUnplugged: true,
  status: LevelStatus.perfect,
  isLocked: false,
  teacherFeedbackReviewState: undefined,
};

const assessmentLevel = {
  id: '2',
  kind: LevelKind.assessment,
  isUnplugged: false,
  status: LevelStatus.perfect,
  isLocked: false,
  teacherFeedbackReviewState: undefined,
};

const keepWorkingLevel = {
  ...unpluggedLevel,
  teacherFeedbackReviewState: ReviewStates.keepWorking,
};

const levelWithUrl = {
  ...unpluggedLevel,
  url: '/foo/bar',
};

const DEFAULT_PROPS = {
  levels: [],
  icon: 'desktop',
  text: '1',
  fontSize: 12,
  disabled: false,
};

describe('ProgressPill', () => {
  it('can render an unplugged pill', () => {
    shallow(
      <ProgressPill levels={[unpluggedLevel]} text="Unplugged Activity" />
    );
  });

  it('renders a provided tooltip', () => {
    const tooltip = <ReactTooltip tooltipId="123" />;

    const wrapper = shallow(
      <ProgressPill
        levels={[unpluggedLevel]}
        text="Unplugged Activity"
        tooltip={tooltip}
      />
    );
    assert.equal(wrapper.find('ReactTooltip').length, 1);
    assert.equal(wrapper.find('div').first().props()['data-tip'], true);
    assert.equal(wrapper.find('div').first().props()['data-for'], 123);
  });

  it('has an href when single level with url', () => {
    const wrapper = shallow(
      <ProgressPill levels={[levelWithUrl]} text="Unplugged Activity" />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar');
  });

  it('includes section in href when selectedSectionId is present', () => {
    const wrapper = shallow(
      <ProgressPill
        levels={[levelWithUrl]}
        text="Unplugged Activity"
        selectedSectionId={1234}
      />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar?section_id=1234');
  });

  it('includes user_id in href when user_id query param is present', () => {
    jest.spyOn(utils, 'queryParams').mockClear().mockReturnValue('123');
    const wrapper = shallow(
      <ProgressPill levels={[levelWithUrl]} text="Unplugged Activity" />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar?user_id=123');
    utils.queryParams.mockRestore();
  });

  it('does not have an href when disabled', () => {
    const wrapper = shallow(
      <ProgressPill
        levels={[levelWithUrl]}
        text="Unplugged Activity"
        disabled={true}
      />
    );
    assert.equal(wrapper.find('a').props().href, undefined);
  });

  it('has an keep working icon when single level has keepWorking feedback', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[keepWorkingLevel]} />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.keepWorking);
  });

  it('does not have an keep working icon when pill represents multiple levels', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        levels={[keepWorkingLevel, keepWorkingLevel, keepWorkingLevel]}
      />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(0);
  });

  it('has an keep working icon when single level is assessment and has keepWorking feedback', () => {
    const level = {
      ...assessmentLevel,
      teacherFeedbackReviewState: ReviewStates.keepWorking,
    };
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[level]} />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.keepWorking);
  });

  it('has an assessment icon when single level is assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[assessmentLevel]} />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.at(0).props().badgeType).to.equal(BadgeType.assessment);
  });

  it('does not have an assessment icon when single level is not assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[unpluggedLevel]} />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(0);
  });

  it('does not have an assessment icon when multiple assessment levels', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        levels={[assessmentLevel, assessmentLevel]}
      />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).to.have.lengthOf(0);
  });
});
