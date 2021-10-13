import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import Immutable from 'immutable';
import {shallow} from 'enzyme';
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
  ttsAutoplayEnabled: false
};

describe('ProgressLessonTeacherInfo', () => {
  it('renders a blue Button if and only if we have a lesson plan', () => {
    const lessonWithoutPlan = fakeLesson('Maze', 1);
    const lessonWithPlan = {
      ...fakeLesson('Maze', 1),
      lesson_plan_html_url: 'foo/bar'
    };

    const [wrapperWithoutPlan, wrapperWithPlan] = [
      lessonWithoutPlan,
      lessonWithPlan
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}}
          })}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    assert.equal(wrapperWithoutPlan.find('Button').length, 0);
    assert.equal(wrapperWithPlan.find('Button').props().color, 'blue');
  });

  it('updates the lesson url to require login', () => {
    const lessonWithoutPlan = {
      ...fakeLesson('Maze', 1)
    };
    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lessonWithoutPlan}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}}
        })}
        unitName="My Unit"
        hasNoSections={false}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={false}
      />
    );
    assert.equal(
      wrapper.find('SendLesson').props().lessonUrl,
      'code.org?login_required=true'
    );
  });

  it('renders a purple Button if and only if we have a student lesson plan', () => {
    const lessonWithoutPlan = {
      ...fakeLesson('Maze', 1)
    };
    const lessonWithPlan = {
      ...fakeLesson('Maze', 1),
      student_lesson_plan_html_url: 'foo/bar/student'
    };

    const [wrapperWithoutPlan, wrapperWithPlan] = [
      lessonWithoutPlan,
      lessonWithPlan
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}}
          })}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    assert.equal(wrapperWithoutPlan.find('Button').length, 0);
    assert.equal(wrapperWithPlan.find('Button').props().color, 'purple');
    assert.equal(
      wrapperWithPlan.find('Button').props().href,
      'foo/bar/student'
    );
  });

  it('renders our LessonLock button when lesson is lockable and teacher is lockable authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable] = [
      lockableLesson,
      unlockableLesson
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}}
          })}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={true}
        />
      )
    );

    assert.equal(wrapperLockable.find('Connect(LessonLock)').length, 1);
    assert.equal(wrapperUnlockable.find('Connect(LessonLock)').length, 0);
  });

  it('does not render LessonLock button when lesson is lockable and teacher is not lockable authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable] = [
      lockableLesson,
      unlockableLesson
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_SECTION}
          unitAllowsHiddenLessons={false}
          hiddenLessonState={Immutable.fromJS({
            lessonsBySection: {11: {}}
          })}
          unitName="My Unit"
          hasNoSections={false}
          toggleHiddenLesson={() => {}}
          lockableAuthorized={false}
        />
      )
    );

    assert.equal(wrapperLockable.find('Connect(LessonLock)').length, 0);
    assert.equal(wrapperUnlockable.find('Connect(LessonLock)').length, 0);
  });

  it('does not render our LessonLock button when we have no sections', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}}
        })}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={true}
      />
    );

    assert.equal(wrapper.find('Connect(LessonLock)').length, 0);
  });

  it('renders SendLessonDialog with only start url', () => {
    const lesson = {
      ...fakeLesson('Maze', 1)
    };

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}}
        })}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={true}
      />
    );

    assert.equal(wrapper.find('SendLesson').length, 1);
  });

  it('does not render SendLessonDialog when lockable lesson and teacher is not authorized', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        section={MOCK_SECTION}
        unitAllowsHiddenLessons={false}
        hiddenLessonState={Immutable.fromJS({
          lessonsBySection: {11: {}}
        })}
        unitName="My Unit"
        hasNoSections={true}
        toggleHiddenLesson={() => {}}
        lockableAuthorized={false}
      />
    );

    assert.equal(wrapper.find('SendLesson').length, 0);
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
              lessonsBySection: {11: {}}
            })}
            unitName="My Unit"
            hasNoSections={false}
            toggleHiddenLesson={() => {}}
            lockableAuthorized={false}
          />
        )
    );

    assert.equal(withSection.find('Connect(HiddenForSectionToggle)').length, 1);
    assert.equal(
      withoutSection.find('Connect(HiddenForSectionToggle)').length,
      0
    );
  });
});
