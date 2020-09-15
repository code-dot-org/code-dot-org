import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import Immutable from 'immutable';
import {shallow} from 'enzyme';
import {UnconnectedProgressLessonTeacherInfo as ProgressLessonTeacherInfo} from '@cdo/apps/templates/progress/ProgressLessonTeacherInfo';
import {fakeLesson} from '@cdo/apps/templates/progress/progressTestHelpers';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';

const MOCK_GOOGLE_SECTION = {
  id: 1,
  name: 'intro to computer science I',
  stageExtras: true,
  pairingAllowed: true,
  studentCount: 6,
  code: 'G-149414657094',
  providerManaged: true,
  loginType: OAuthSectionTypes.google_classroom
};

const MOCK_NON_GOOGLE_SECTION = {
  id: 2,
  name: 'intro to computer science II',
  stageExtras: true,
  pairingAllowed: true,
  studentCount: 4,
  code: 'TQGSJR',
  providerManaged: false
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
          section={MOCK_NON_GOOGLE_SECTION}
          levelUrl={'code.org'}
          scriptAllowsHiddenStages={false}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: {11: {}}
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
          showGoogleClassroomButton={false}
        />
      )
    );

    assert.equal(wrapperWithoutPlan.find('Button').length, 0);
    assert.equal(wrapperWithPlan.find('Button').props().color, 'blue');
  });

  it('renders our StageLock button when lesson is lockable', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);
    const unlockableLesson = fakeLesson('Maze', 1, false);

    const [wrapperLockable, wrapperUnlockable] = [
      lockableLesson,
      unlockableLesson
    ].map(lesson =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={lesson}
          section={MOCK_NON_GOOGLE_SECTION}
          levelUrl={'code.org'}
          scriptAllowsHiddenStages={false}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: {11: {}}
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
          showGoogleClassroomButton={false}
        />
      )
    );

    assert.equal(wrapperLockable.find('Connect(StageLock)').length, 1);
    assert.equal(wrapperUnlockable.find('Connect(StageLock)').length, 0);
  });

  it('does not render our StageLock button when we have no sections', () => {
    const lockableLesson = fakeLesson('Maze', 1, true);

    const wrapper = shallow(
      <ProgressLessonTeacherInfo
        lesson={lockableLesson}
        section={MOCK_NON_GOOGLE_SECTION}
        levelUrl={'code.org'}
        scriptAllowsHiddenStages={false}
        hiddenStageState={Immutable.fromJS({
          stagesBySection: {11: {}}
        })}
        scriptName="My Script"
        hasNoSections={true}
        toggleHiddenStage={() => {}}
        showGoogleClassroomButton={false}
      />
    );

    assert.equal(wrapper.find('Connect(StageLock)').length, 0);
  });

  it('renders our HiddenForSectionToggle when we have a section', () => {
    const [withSection, withoutSection] = [
      MOCK_NON_GOOGLE_SECTION,
      undefined
    ].map(section =>
      shallow(
        <ProgressLessonTeacherInfo
          lesson={fakeLesson('Maze', 1)}
          section={section}
          levelUrl={'code.org'}
          scriptAllowsHiddenStages={true}
          hiddenStageState={Immutable.fromJS({
            stagesBySection: {11: {}}
          })}
          scriptName="My Script"
          hasNoSections={false}
          toggleHiddenStage={() => {}}
          showGoogleClassroomButton={false}
        />
      )
    );

    assert.equal(withSection.find('HiddenForSectionToggle').length, 1);
    assert.equal(withoutSection.find('HiddenForSectionToggle').length, 0);
  });

  it('only renders google share button when showGoogleClassroomButton is true', () => {
    const [shouldShow, shouldNotShow] = [true, false].map(
      showGoogleClassroomButton =>
        shallow(
          <ProgressLessonTeacherInfo
            lesson={fakeLesson('Maze', 1)}
            section={MOCK_GOOGLE_SECTION}
            levelUrl={'code.org'}
            scriptAllowsHiddenStages={true}
            hiddenStageState={Immutable.fromJS({
              stagesBySection: {11: {}}
            })}
            scriptName="My Script"
            hasNoSections={false}
            toggleHiddenStage={() => {}}
            showGoogleClassroomButton={showGoogleClassroomButton}
          />
        )
    );

    const button = 'GoogleClassroomShareButton';
    assert.equal(shouldShow.find(button).length, 1);
    assert.equal(shouldNotShow.find(button).length, 0);
  });
});
