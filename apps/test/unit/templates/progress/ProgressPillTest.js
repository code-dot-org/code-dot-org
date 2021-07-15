import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedProgressPill as ProgressPill} from '@cdo/apps/templates/progress/ProgressPill';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import ReactTooltip from 'react-tooltip';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import {
  AssessmentBadge,
  KeepWorkingBadge
} from '@cdo/apps/templates/progress/BubbleBadge';

const unpluggedLevel = {
  id: '1',
  kind: LevelKind.unplugged,
  isUnplugged: true,
  status: LevelStatus.perfect,
  isLocked: false,
  teacherFeedbackReviewState: undefined
};

const assessmentLevel = {
  id: '2',
  kind: LevelKind.assessment,
  isUnplugged: false,
  status: LevelStatus.perfect,
  isLocked: false,
  teacherFeedbackReviewState: undefined
};

const keepWorkingLevel = {
  ...unpluggedLevel,
  teacherFeedbackReviewState: ReviewStates.keepWorking
};

const levelWithUrl = {
  ...unpluggedLevel,
  url: '/foo/bar'
};

const DEFAULT_PROPS = {
  levels: [],
  icon: 'desktop',
  text: '1',
  fontSize: 12,
  disabled: false
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
    assert.equal(
      wrapper
        .find('div')
        .first()
        .props()['data-tip'],
      true
    );
    assert.equal(
      wrapper
        .find('div')
        .first()
        .props()['data-for'],
      123
    );
  });

  it('has an href when single level with url', () => {
    const wrapper = shallow(
      <ProgressPill levels={[levelWithUrl]} text="Unplugged Activity" />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar');
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
    expect(wrapper.find(KeepWorkingBadge)).to.have.lengthOf(1);
  });

  it('does not have an keep working icon when pill represents multiple levels', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        levels={[keepWorkingLevel, keepWorkingLevel, keepWorkingLevel]}
      />
    );
    expect(wrapper.find(KeepWorkingBadge)).to.have.lengthOf(0);
  });

  it('has an keep working icon when single level is assessment and has keepWorking feedback', () => {
    const level = {
      ...assessmentLevel,
      teacherFeedbackReviewState: ReviewStates.keepWorking
    };
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[level]} />
    );
    expect(wrapper.find(KeepWorkingBadge)).to.have.lengthOf(1);
  });

  it('has an assessment icon when single level is assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[assessmentLevel]} />
    );
    expect(wrapper.find(AssessmentBadge)).to.have.lengthOf(1);
  });

  it('does not have an assessment icon when single level is not assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[unpluggedLevel]} />
    );
    expect(wrapper.find(AssessmentBadge)).to.have.lengthOf(0);
  });

  it('does not have an assessment icon when multiple assessment levels', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        levels={[assessmentLevel, assessmentLevel]}
      />
    );
    expect(wrapper.find(AssessmentBadge)).to.have.lengthOf(0);
  });
});
