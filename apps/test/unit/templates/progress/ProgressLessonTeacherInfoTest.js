import { assert } from '../../../util/configuredChai';
import React from 'react';
import Immutable from 'immutable';
import { shallow } from 'enzyme';
import { UnconnectedProgressLessonTeacherInfo as ProgressLessonTeacherInfo }
  from '@cdo/apps/templates/progress/ProgressLessonTeacherInfo';
import { fakeLesson } from '@cdo/apps/templates/progress/progressTestHelpers';


describe('ProgressLessonTeacherInfo', () => {
  it('renders a blue Button if and only if we have a lesson plan', () => {
    const lessonWithoutPlan = fakeLesson('Maze', 1);
    const lessonWithPlan = {
      ...fakeLesson('Maze', 1),
      lesson_plan_html_url: 'foo/bar'
    };

    const [wrapperWithoutPlan, wrapperWithPlan]  = [lessonWithoutPlan, lessonWithPlan].map(lesson => (
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          sectionId={'11'}
          scriptAllowsHiddenStages={false}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: { 11: {} }
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
        />
      )
    ));

    assert.equal(wrapperWithoutPlan.find('Button').length, 0);
    assert.equal(wrapperWithPlan.find('Button').props().color, 'blue');
  });

  it('renders our StageLock button when lesson is lockable', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable]  = [lockableLesson, unlockableLesson].map(lesson => (
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          sectionId={'11'}
          scriptAllowsHiddenStages={false}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: { 11: {} }
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
        />
      )
    ));

    assert.equal(wrapperLockable.find('Connect(StageLock)').length, 1);
    assert.equal(wrapperUnlockable.find('Connect(StageLock)').length, 0);
  });

  it('does not render our StageLock button when we have no sections', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        sectionId={'11'}
        scriptAllowsHiddenStages={false}
        hiddenStageState={Immutable.fromJS({
          stagesBySection: { 11: {} }
        })}
        scriptName="My Script"
        hasNoSections={true}
        toggleHiddenStage={() => {}}
      />
    );

    assert.equal(wrapper.find('Connect(StageLock)').length, 0);
  });

  it('renders our HiddenForSectionToggle when we have a section id', () => {
    const [withId, withoutId] = ['11', undefined].map(sectionId => (
      shallow(
        <ProgressLessonTeacherInfo
          lesson={fakeLesson('Maze', 1)}
          sectionId={sectionId}
          scriptAllowsHiddenStages={true}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: { 11: {} }
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
        />
      )
    ));

    assert.equal(withId.find('HiddenForSectionToggle').length, 1);
    assert.equal(withoutId.find('HiddenForSectionToggle').length, 0);
  });
});
