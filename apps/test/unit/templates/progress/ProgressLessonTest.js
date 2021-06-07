import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedProgressLesson as ProgressLesson} from '@cdo/apps/templates/progress/ProgressLesson';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';
import color from '@cdo/apps/util/color';

describe('ProgressLesson', () => {
  const defaultProps = {
    currentLessonId: 1,
    lesson: {
      ...fakeLesson('lesson1', 1),
      description_teacher: 'Teacher description here',
      description_student: 'Student description here'
    },
    levels: fakeLevels(3),
    lessonNumber: 3,
    showTeacherInfo: false,
    viewAs: ViewType.Teacher,
    lessonIsVisible: () => true,
    lessonIsLockedForUser: () => false,
    lessonIsLockedForAllStudents: () => false,
    lockableAuthorized: true
  };

  it('renders with gray background when not hidden', () => {
    const wrapper = shallow(<ProgressLesson {...defaultProps} />);
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

    assert.equal(wrapper.html(), null);
  });

  it('renders with dashed border and not faded when viewing a hidden lesson as a teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('div')
        .at(1)
        .props().style.opacity,
      undefined
    );
  });

  it('renders with dashed border and faded out when locked for user', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('div')
        .at(1)
        .props().style.opacity,
      0.6
    );
  });

  it('renders with dashed border and not faded out when locked for section', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForAllStudents={() => true}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
    assert.equal(wrapper.props().style.borderWidth, 4);
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('div')
        .at(1)
        .props().style.opacity,
      undefined
    );
  });

  it('disables bubbles when locked for user', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(wrapper.find('ProgressLessonContent').props().disabled, true);
  });

  it('renders with gray background when lesson is lockable but unlocked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForUser={() => false}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
  });

  it('has an unlocked icon when lesson is lockable but unlocked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForUser={() => false}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'caret-down'
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(1)
        .props().icon,
      'unlock'
    );
  });

  it('has a locked icon when lesson is lockable and locked', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'caret-down'
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(1)
        .props().icon,
      'lock'
    );
  });

  it('has both a hidden and a locked icon for teacher when lesson is lockable and locked and hidden', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'caret-down'
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(1)
        .props().icon,
      'eye-slash'
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(2)
        .props().icon,
      'lock'
    );
  });

  it('starts collapsed for student if it is not the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        currentLessonId={2}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);
  });

  it('starts uncollapsed for teacher even if not the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
        currentLessonId={2}
      />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('starts uncollapsed for student if it is the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Student} />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('starts uncollapsed for teacher if it is the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Teacher} />
    );
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('uncollapses itself for student when currentLesson gets updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        currentLessonId={null}
        viewAs={ViewType.Student}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);

    wrapper.setProps({currentLessonId: 1});
    assert.equal(wrapper.state('collapsed'), false);
  });

  it('does not change collapse state when other props are updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        currentLessonId={null}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);

    wrapper.setProps({foo: 'bar'});
    assert.equal(wrapper.state('collapsed'), true);
  });

  it('shows student description when viewing as student', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Student} />
    );
    assert.equal(
      wrapper.find('ProgressLessonContent').props().description,
      'Student description here'
    );
  });

  it('shows teacher description when viewing as teacher', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Teacher} />
    );
    assert.equal(
      wrapper.find('ProgressLessonContent').props().description,
      'Teacher description here'
    );
  });

  it('shows not verified warning on lockable lesson when viewing as unverified teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
        lesson={fakeLesson('lesson1', 1, true)}
        lockableAuthorized={false}
        lessonIsLockedForUser={() => true}
      />
    );
    expect(wrapper.text()).to.include(
      'This lesson is locked - you need to become a verified teacher to unlock it.'
    );
  });

  it('does not show not verified warning on lockable lesson when viewing as verified teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
        lesson={fakeLesson('lesson1', 1, true)}
        lockableAuthorized={true}
      />
    );
    expect(wrapper.text()).to.not.include(
      'This lesson is locked - you need to become a verified teacher to unlock it.'
    );
  });

  it('shows Lesson Resources button when viewing as a student and student_lesson_plan_html_url is not null', () => {
    let myLesson = defaultProps.lesson;
    myLesson.student_lesson_plan_html_url = 'test-url';
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={myLesson}
        viewAs={ViewType.Student}
      />
    );
    assert.equal(wrapper.find('Button').props().href, 'test-url');
    delete myLesson.student_lesson_plan_html_url;
  });

  it('does not show Lesson Resources button when viewing as a student and student_lesson_plan_html_url is null', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Student} />
    );
    assert.equal(wrapper.find('Button').length, 0);
  });

  it('does not show Lesson Resources button when viewing as a teacher and student_lesson_plan_html_url is not null', () => {
    let myLesson = defaultProps.lesson;
    myLesson.student_lesson_plan_html_url = 'test-url';
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={myLesson}
        viewAs={ViewType.Teacher}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
    delete myLesson.student_lesson_plan_html_url;
  });

  it('does not lock non-lockable lessons, such as peer reviews', () => {
    // Simulate a peer review section, where the levels may be locked, but the lesson
    // itself is not lockable
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        levels={defaultProps.levels.map(level => ({
          ...level,
          isLocked: true
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
