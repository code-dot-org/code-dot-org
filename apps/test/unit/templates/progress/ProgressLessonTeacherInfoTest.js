import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import Immutable from 'immutable';
import React from 'react';

import {UnconnectedProgressLessonTeacherInfo as ProgressLessonTeacherInfo} from '@cdo/apps/templates/progress/ProgressLessonTeacherInfo';
import {fakeLesson} from '@cdo/apps/templates/progress/progressTestHelpers';

const MOCK_SECTION = {
  id: 2,
  name: 'intro to computer science II',
  lessonExtras: true,
  pairingAllowed: true,
  studentCount: 4,
  code: 'TQGSJR',
  providerManaged: false,
  ttsAutoplayEnabled: false,
};

describe('ProgressLessonTeacherInfo', () => {
  it('renders a blue Button if and only if we have a lesson plan', () => {
    const lessonWithoutPlan = fakeLesson('Maze', 1);
    const lessonWithPlan = {
      ...fakeLesson('Maze', 1),
      lesson_plan_html_url: 'foo/bar',
    };

    const [wrapperWithoutPlan, wrapperWithPlan] = [
      lessonWithoutPlan,
      lessonWithPlan,
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}},
          })}
          unitId={17}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    expect(wrapperWithoutPlan.find('Button').length).toEqual(0);
    expect(wrapperWithPlan.find('Button').props().color).toEqual('blue');
    expect(wrapperWithPlan.find('Button').props().href).toEqual('foo/bar');
  });

  it('updates the lesson url to require login', () => {
    const lessonWithoutPlan = {
      ...fakeLesson('Maze', 1),
    };
    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lessonWithoutPlan}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}},
        })}
        unitId={17}
        unitName="My Unit"
        hasNoSections={false}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={false}
      />
    );
    expect(wrapper.find('SendLesson').props().lessonUrl).toEqual(
      'code.org?login_required=true'
    );
  });

  it('renders a purple Button if and only if we have a student lesson plan', () => {
    const lessonWithoutPlan = {
      ...fakeLesson('Maze', 1),
    };
    const lessonWithPlan = {
      ...fakeLesson('Maze', 1),
      student_lesson_plan_html_url: 'foo/bar/student',
    };

    const [wrapperWithoutPlan, wrapperWithPlan] = [
      lessonWithoutPlan,
      lessonWithPlan,
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}},
          })}
          unitId={17}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    expect(wrapperWithoutPlan.find('Button').length).toEqual(0);
    expect(wrapperWithPlan.find('Button').props().color).toEqual('purple');
    expect(wrapperWithPlan.find('Button').props().href).toEqual(
      'foo/bar/student'
    );
  });

  it('renders our LessonLock button when lesson is lockable and teacher is lockable authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable] = [
      lockableLesson,
      unlockableLesson,
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}},
          })}
          unitId={17}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={true}
        />
      )
    );

    expect(wrapperLockable.find('LessonLock').length).toEqual(1);
    expect(wrapperUnlockable.find('LessonLock').length).toEqual(0);
  });

  it('does not render LessonLock button when lesson is lockable and teacher is not lockable authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable] = [
      lockableLesson,
      unlockableLesson,
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}},
          })}
          unitId={17}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    expect(wrapperLockable.find('LessonLock').length).toEqual(0);
    expect(wrapperUnlockable.find('LessonLock').length).toEqual(0);
  });

  it('does not render our LessonLock button when we have no sections', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}},
        })}
        unitId={17}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={true}
      />
    );

    expect(wrapper.find('LessonLock').length).toEqual(0);
  });

  it('renders SendLessonDialog with only start url', () => {
    const lesson = {
      ...fakeLesson('Maze', 1),
    };

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}},
        })}
        unitId={17}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={true}
      />
    );

    expect(wrapper.find('SendLesson').length).toEqual(1);
  });

  it('does not render SendLessonDialog when lockable lesson and teacher is not authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}},
        })}
        unitId={17}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={false}
      />
    );

    expect(wrapper.find('SendLesson').length).toEqual(0);
  });

  it('renders Rate This Lesson only if lesson feedback url', () => {
    const lesson = {
      ...fakeLesson('Maze', 1),
      lesson_feedback_url: 'foo/bar/feedback',
    };

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}},
        })}
        unitId={17}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={true}
      />
    );

    expect(wrapper.find('.rate-lesson-button').length).toEqual(1);
  });

  it('renders our HiddenForSectionToggle when we have a section', () => {
    const [withSection, withoutSection] = [MOCK_SECTION, undefined].map(
      section =>
        shallow(
          <ProgressLessonTeacherInfo
            lesson={fakeLesson('Maze', 1)}
            section={section}
            unitAllowsHiddenLessons={true}
            hiddenLessonState={Immutable.fromJS({
              lessonsBySection: {11: {}},
            })}
            unitId={17}
            unitName="My Unit"
            hasNoSections={false}
            toggleHiddenLesson={() => {}}
            lockableAuthorized={false}
          />
        )
    );

    expect(withSection.find('Connect(HiddenForSectionToggle)').length).toEqual(
      1
    );
    expect(
      withoutSection.find('Connect(HiddenForSectionToggle)').length
    ).toEqual(0);
  });
});
