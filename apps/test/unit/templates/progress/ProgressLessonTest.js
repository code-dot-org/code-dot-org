import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedProgressLesson as ProgressLesson } from '@cdo/apps/templates/progress/ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { fakeLesson, fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';
import color from "@cdo/apps/util/color";
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

describe('ProgressLesson', () => {
  const defaultProps = {
    currentStageId: 1,
    lesson: {
      ...fakeLesson('lesson1', 1),
      description_teacher: 'Teacher description here',
      description_student: 'Student description here'
    },
    levels: fakeLevels(3),
    lessonNumber: 3,
    showTeacherInfo: false,
    viewAs: ViewType.Teacher,
    showLockIcon: true,
    lessonIsVisible: () => true,
    lessonLockedForSection: () => false
  };

  it('renders with gray background when not hidden', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
  });

  it('does not render when lessonIsVisible is false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonIsVisible={() => false}
        viewAs={ViewType.Student}
      />
    );

    assert.equal(wrapper.node, null);
  });

  it('renders with dashed border when only visible for teachers', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when section is locked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => true}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('disables bubbles when section is locked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => true}
      />
    );
    assert.equal(wrapper.find('ProgressLessonContent').props().disabled, true);
  });

  it('renders with dashbed border when locked for individual student', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => false}
        levels={defaultProps.levels.map(level => ({...level, status: LevelStatus.locked}))}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with gray background when section is lockable but unlocked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => false}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
  });

  it('has an unlocked icon when section is lockable but unlocked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => false}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'caret-down');
    assert.equal(wrapper.find('FontAwesome').at(1).props().icon, 'unlock');
  });

  it('has a locked icon when section is lockable and locked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonLockedForSection={() => true}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'caret-down');
    assert.equal(wrapper.find('FontAwesome').at(1).props().icon, 'lock');
  });

  it('has both a hidden and a locked icon when section is lockable and locked and hidden', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
        lessonLockedForSection={() => true}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'caret-down');
    assert.equal(wrapper.find('FontAwesome').at(1).props().icon, 'eye-slash');
    assert.equal(wrapper.find('FontAwesome').at(2).props().icon, 'lock');
  });

  it('does not have an unlocked icon if showLockIcon=false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        showLockIcon={false}
        lesson={fakeLesson('lesson1', 1, true)}
      />
    );
    assert.equal(wrapper.find('FontAwesome').length, 1);
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'caret-down');
  });

  it('starts collapsed for student if it is not the current stage', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        currentStageId={2}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);
  });

  it('starts uncollapsed for teacher even if not the current stage', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
        currentStageId={2}
      />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('starts uncollapsed for student if it is the current stage', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
      />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('starts uncollapsed for teacher if it is the current stage', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
      />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('uncollapses itself for student when currentStage gets updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        currentStageId={null}
        viewAs={ViewType.Student}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);

    wrapper.setProps({currentStageId: 1});
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('does not change collapse state when other props are updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        currentStageId={null}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);

    wrapper.setProps({foo: 'bar'});
    assert.equal(wrapper.state('collapsed'), true);
  });

  it('shows student description when viewing as student', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
      />
    );
    assert.equal(wrapper.find('ProgressLessonContent').props().description, 'Student description here');
  });

  it('shows teacher description when viewing as teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
      />
    );
    assert.equal(wrapper.find('ProgressLessonContent').props().description, 'Teacher description here');
  });

  it('does not lock non-lockable stages, such as peer reviews', () => {
    // Simulate a peer review section, where the levels may be locked, but the lesson
    // itself is not lockable
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonLockedForSection={() => true}
        levels={defaultProps.levels.map(level => ({
          ...level,
          status: LevelStatus.locked
        }))}
        lesson={{
          ...defaultProps.lesson,
          lockable: false
        }}
      />
    );
    // If locked, it would have a dashed border
    assert.equal(wrapper.props().style.borderStyle, 'solid');
    assert.equal(wrapper.find('ProgressLessonContent').props().disabled, false);
  });
});
