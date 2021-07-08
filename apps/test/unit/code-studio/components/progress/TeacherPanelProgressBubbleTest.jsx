import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import color from '@cdo/apps/util/color';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';

const defaultUserLevel = {
  id: 123,
  assessment: null,
  contained: false,
  driver: null,
  isConceptLevel: false,
  levelNumber: 4,
  navigator: null,
  paired: false,
  passed: false,
  bonus: false,
  status: LevelStatus.not_tried,
  user_id: 1,
  teacherFeedbackReivewState: null
};

const setUp = (overrideUserLevel = {}) => {
  const props = {
    userLevel: {
      ...defaultUserLevel,
      ...overrideUserLevel
    }
  };
  return shallow(<TeacherPanelProgressBubble {...props} />);
};

describe('TeacherPanelProgressBubbleTest', () => {
  it('shows pair programming logo if level is paired as navigator', () => {
    const wrapper = setUp({paired: true, driver: 'My Friend'});
    expect(wrapper.find('FontAwesome')).to.have.length(1);
  });

  it('shows pair programming logo if level is paired as driver', () => {
    const wrapper = setUp({paired: true, navigator: 'My Friend'});
    expect(wrapper.find('FontAwesome')).to.have.length(1);
  });

  it('shows number in bubble if not paired and not bonus', () => {
    const wrapper = setUp();
    expect(wrapper.find('FontAwesome')).to.have.length(0);
    assert(wrapper.containsMatchingElement(<span>{4}</span>));
  });

  it('has a green background when we have perfect status and not assessment', () => {
    const wrapper = setUp({
      passed: true,
      status: LevelStatus.perfect,
      assessment: false
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
  });

  it('has a purple background when level status is LevelStatus.completed_assessment, is an assessment level', () => {
    const wrapper = setUp({
      passed: true,
      kind: LevelKind.assessment,
      status: LevelStatus.completed_assessment
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
  });

  it('has green border and white background for in progress level', () => {
    const wrapper = setUp({
      status: LevelStatus.attempted
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a green border and light green background for too many blocks level', () => {
    const wrapper = setUp({
      passed: true,
      status: LevelStatus.passed
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_passed);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a purple background for submitted level', () => {
    const wrapper = setUp({
      kind: LevelKind.assessment,
      status: LevelStatus.submitted,
      passed: true
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
    assert.equal(div.props().style.borderColor, color.level_submitted);
    assert.equal(div.props().style.color, color.white);
  });

  it('renders a diamond for concept levels', () => {
    const wrapper = setUp({
      isConceptLevel: true
    });

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
  });

  it('hides keep working badge if teacherFeedbackReivewState is completed', () => {
    const wrapper = setUp({
      teacherFeedbackReivewState: ReviewStates.completed
    });

    expect(wrapper.find(KeepWorkingBadge)).to.have.length(0);
  });

  it('displays keep working badge if teacherFeedbackReivewState is keepWorking', () => {
    const wrapper = setUp({
      teacherFeedbackReivewState: ReviewStates.keepWorking
    });
    expect(wrapper.find(KeepWorkingBadge)).to.have.length(1);
  });
});
