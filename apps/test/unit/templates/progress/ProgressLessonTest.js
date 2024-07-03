import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {UnconnectedProgressLesson as ProgressLesson} from '@cdo/apps/templates/progress/ProgressLesson';
import {
  fakeLesson,
  fakeLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import color from '@cdo/apps/util/color';

describe('ProgressLesson', () => {
  const lessonNumber = 3;
  const defaultProps = {
    lesson: {
      ...fakeLesson('lesson1', 1, false, lessonNumber),
      description_teacher: 'Teacher description here',
      description_student: 'Student description here',
    },
    levels: fakeLevels(3),
    currentLessonId: 1,
    viewAs: ViewType.Instructor,
    isVisible: true,
    hiddenForStudents: false,
    isLockedForUser: false,
    isLockedForAllStudents: false,
    lockableAuthorizedLoaded: true,
    lockableAuthorized: true,
    isMiniView: false,
    lockStatusLoaded: true,
  };

  // This ID is used by the EndOfLessonDialog to scroll the recently completed lesson into view
  it('renders with ID = progress-lesson-<lessonNumber>', () => {
    const wrapper = shallow(<ProgressLesson {...defaultProps} />);
    expect(wrapper.props().id).toEqual('progress-lesson-3');
  });

  it('renders with gray background when not hidden', () => {
    const wrapper = shallow(<ProgressLesson {...defaultProps} />);
    expect(wrapper.props().style.background).toEqual(color.lightest_gray);
  });

  it('does not render when isVisible is false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        isVisible={false}
        hiddenForStudents={true}
        viewAs={ViewType.Participant}
      />
    );

    expect(wrapper.html()).toEqual(null);
  });

  it('renders with dashed border and not faded when viewing a hidden lesson as a instructor', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        hiddenForStudents={true}
        isVisible={true}
      />
    );
    expect(wrapper.props().style.background).toEqual(color.lightest_gray);
    expect(wrapper.props().style.borderWidth).toEqual(4);
    expect(wrapper.props().style.borderStyle).toEqual('dashed');
    expect(wrapper.find('div').at(1).props().style.opacity).toEqual(undefined);
  });

  it('renders with dashed border and faded out when locked for user', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForUser={true}
      />
    );
    expect(wrapper.props().style.background).toEqual(color.lightest_gray);
    expect(wrapper.props().style.borderWidth).toEqual(4);
    expect(wrapper.props().style.borderStyle).toEqual('dashed');
    expect(wrapper.find('div').at(1).props().style.opacity).toEqual(0.6);
  });

  it('renders with dashed border and not faded out when locked for section', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForAllStudents={true}
      />
    );
    expect(wrapper.props().style.background).toEqual(color.lightest_gray);
    expect(wrapper.props().style.borderWidth).toEqual(4);
    expect(wrapper.props().style.borderStyle).toEqual('dashed');
    expect(wrapper.find('div').at(1).props().style.opacity).toEqual(undefined);
  });

  it('disables bubbles when locked for user', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForUser={true}
      />
    );
    expect(wrapper.find('ProgressLessonContent').props().disabled).toEqual(
      true
    );
  });

  it('renders with gray background when lesson is lockable but unlocked and lockStatusLoaded', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForUser={false}
        lockStatusLoaded={true}
      />
    );
    expect(wrapper.props().style.background).toEqual(color.lightest_gray);
  });

  it('has an unlocked icon when lesson is lockable but unlocked and lockStatusLoaded', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForUser={false}
        lockStatusLoaded={true}
      />
    );
    expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual(
      'caret-down'
    );
    expect(wrapper.find('FontAwesome').at(1).props().icon).toEqual('unlock');
  });

  it('has a locked icon when lesson is lockable and locked and lockStatusLoaded', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isLockedForUser={true}
        lockStatusLoaded={true}
      />
    );
    expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual(
      'caret-down'
    );
    expect(wrapper.find('FontAwesome').at(1).props().icon).toEqual('lock');
  });

  it('has both a hidden and a locked icon for instructor when lesson is lockable and locked and hidden and lockStatusLoaded', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={fakeLesson('lesson1', 1, true)}
        isVisible={true}
        hiddenForStudents={true}
        isLockedForUser={true}
        lockStatusLoaded={true}
      />
    );
    expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual(
      'caret-down'
    );
    expect(wrapper.find('FontAwesome').at(1).props().icon).toEqual('eye-slash');
    expect(wrapper.find('FontAwesome').at(2).props().icon).toEqual('lock');
  });

  it('starts collapsed for participant if it is not the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Participant}
        currentLessonId={2}
      />
    );
    expect(wrapper.state('collapsed')).toEqual(true);
  });

  it('starts uncollapsed for instructor even if not the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        currentLessonId={2}
      />
    );
    expect(wrapper.state('collapsed')).toEqual(false);
  });

  it('starts uncollapsed for participant if it is the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Participant} />
    );
    expect(wrapper.state('collapsed')).toEqual(false);
  });

  it('starts uncollapsed for instructor if it is the current lesson', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Instructor} />
    );
    expect(wrapper.state('collapsed')).toEqual(false);
  });

  it('uncollapses itself for participant when currentLesson gets updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        currentLessonId={null}
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.state('collapsed')).toEqual(true);

    wrapper.setProps({currentLessonId: 1});
    expect(wrapper.state('collapsed')).toEqual(false);
  });

  it('does not change collapse state when other props are updated', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Participant}
        currentLessonId={null}
      />
    );
    expect(wrapper.state('collapsed')).toEqual(true);

    wrapper.setProps({foo: 'bar'});
    expect(wrapper.state('collapsed')).toEqual(true);
  });

  it('shows participant description when viewing as participant', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Participant} />
    );
    expect(wrapper.find('ProgressLessonContent').props().description).toEqual(
      'Student description here'
    );
  });

  it('shows instructor description when viewing as instructor', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Instructor} />
    );
    expect(wrapper.find('ProgressLessonContent').props().description).toEqual(
      'Teacher description here'
    );
  });

  it('shows not verified warning on lockable lesson when lockableAuthorizedLoaded and lockableAuthorized is false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        lesson={fakeLesson('lesson1', 1, true)}
        lockableAuthorizedLoaded={true}
        lockableAuthorized={false}
        isLockedForUser={true}
      />
    );
    expect(wrapper.text()).toContain(
      'This lesson is locked - you need to become a verified teacher to unlock it.'
    );
  });

  it('does not show not verified warning on lockable lesson when lockableAuthorizedLoaded and lockableAuthorized is true', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        lesson={fakeLesson('lesson1', 1, true)}
        lockableAuthorizedLoaded={true}
        lockableAuthorized={true}
      />
    );
    expect(wrapper.text()).not.toContain(
      'This lesson is locked - you need to become a verified teacher to unlock it.'
    );
  });

  it('does not show not verified warning on lockable lesson when lockableAuthorizedLoaded is false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        lesson={fakeLesson('lesson1', 1, true)}
        lockableAuthorizedLoaded={false}
        lockableAuthorized={null}
      />
    );
    expect(wrapper.text()).not.toContain(
      'This lesson is locked - you need to become a verified teacher to unlock it.'
    );
  });

  it('shows Lesson Resources button when viewing as a participant and student_lesson_plan_html_url is not null', () => {
    let myLesson = defaultProps.lesson;
    myLesson.student_lesson_plan_html_url = 'test-url';
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={myLesson}
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.find('Button').props().href).toEqual('test-url');
    delete myLesson.student_lesson_plan_html_url;
  });

  it('does not show Lesson Resources button when viewing as a participant and student_lesson_plan_html_url is null', () => {
    const wrapper = shallow(
      <ProgressLesson {...defaultProps} viewAs={ViewType.Participant} />
    );
    expect(wrapper.find('Button').length).toEqual(0);
  });

  it('does not show Lesson Resources button when viewing as a instructor and student_lesson_plan_html_url is not null', () => {
    let myLesson = defaultProps.lesson;
    myLesson.student_lesson_plan_html_url = 'test-url';
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lesson={myLesson}
        viewAs={ViewType.Instructor}
      />
    );
    expect(wrapper.find('Button').length).toEqual(0);
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
          isLocked: true,
        }))}
        lesson={{
          ...defaultProps.lesson,
          lockable: false,
        }}
      />
    );
    // If locked, it would have a dashed border
    expect(wrapper.props().style.borderStyle).toEqual('solid');
    expect(wrapper.find('ProgressLessonContent').props().disabled).toEqual(
      false
    );
  });

  it('if ProgressLesson displayed in the MiniView it does not show the ProgressLessonTeacherInfo for teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        isMiniView={true}
      />
    );

    expect(wrapper.find('Connect(ProgressLessonTeacherInfo)').length).toEqual(
      0
    );
  });

  it('if ProgressLesson displayed on UnitOverview page it shows the ProgressLessonTeacherInfo for teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Instructor}
        isMiniView={false}
      />
    );

    expect(wrapper.find('Connect(ProgressLessonTeacherInfo)').length).toEqual(
      1
    );
  });
});
