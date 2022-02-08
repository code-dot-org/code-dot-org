import React from 'react';
import {UnconnectedProgressLesson as ProgressLesson} from './ProgressLesson';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {fakeLesson, fakeLevels} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import progress from '@cdo/apps/code-studio/progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import lessonLock from '@cdo/apps/code-studio/lessonLockRedux';

const defaultProps = {
  lesson: fakeLesson('Maze', 1),
  levels: [
    {
      ...fakeLevels(1)[0],
      name: 'First progression'
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({
      ...level,
      progression: 'Second Progression'
    })),
    {
      ...fakeLevels(1)[0],
      name: 'Last progression'
    }
  ],
  viewAs: ViewType.Instructor,
  isVisible: true,
  isLockedForUser: false,
  isLockedForAllStudents: false,
  lockableAuthorized: true,
  lockableAuthorizedLoaded: true,
  hiddenForStudents: false,
  lockStatusLoaded: true
};

const initialState = {
  progress: {
    lessonGroups: [],
    lessons: [
      {
        levels: []
      }
    ],
    focusAreaLessonIds: [],
    isSummaryView: false,
    professionalLearningCourse: false,
    scriptName: 'script-name'
  },
  teacherSections: {
    sectionsAreLoaded: true,
    sections: {},
    sectionIds: []
  },
  hiddenLesson: {},
  lessonLock: {}
};

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLesson', module)
    .withReduxStore(
      {progress, teacherSections, hiddenLesson, lessonLock},
      initialState
    )
    .addStoryTable([
      {
        name: 'progress lesson',
        story: () => <ProgressLesson {...defaultProps} />
      },
      {
        name: 'progress lesson with focus area',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={{
              ...defaultProps.lesson,
              isFocusArea: true
            }}
          />
        )
      },
      {
        name: 'progress lesson for peer reviews',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Participant}
            currentLessonId={-1}
            lesson={{
              id: -1,
              isFocusArea: false,
              lockable: false,
              name: 'You must complete 4 reviews for this unit'
            }}
            levels={[
              {
                id: '-1',
                name: 'Link to submitted review',
                status: LevelStatus.perfect,
                isLocked: false,
                url: '/peer_reviews/1',
                levelNumber: 1
              },
              {
                id: '-1',
                name: 'Review a new submission',
                status: LevelStatus.not_tried,
                isLocked: false,
                url: '/pull-review',
                levelNumber: 2
              },
              {
                id: '-1',
                icon: 'fa-lock',
                name: 'Reviews unavailable at this time',
                status: LevelStatus.not_tried,
                isLocked: true,
                url: '',
                levelNumber: 3
              },
              {
                id: '-1',
                icon: 'fa-lock',
                name: 'Reviews unavailable at this time',
                status: LevelStatus.not_tried,
                isLocked: true,
                url: '',
                levelNumber: 4
              }
            ]}
          />
        )
      },
      {
        name: 'hidden progress lesson as instructor',
        description: 'should be white with full opacity',
        story: () => <ProgressLesson {...defaultProps} isVisible={true} />
      },
      {
        name: 'hidden progress lesson as participant',
        description: 'should not show up',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            hiddenForStudents={true}
            isVisible={true}
          />
        )
      },
      {
        name: 'locked lesson as verified instructor',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Assessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            isLockedForAllStudents={true}
          />
        )
      },
      {
        name: 'unlocked lesson as verified instructor',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            isLockedForAllStudents={false}
          />
        )
      },
      {
        name: 'locked lesson as unverified instructor',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            isLockedForUser={true}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'locked lesson signed out',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Participant}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            isLockedForUser={true}
          />
        )
      },
      {
        name: 'locked lesson as participant',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Participant}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              isLocked: true
            }))}
            isLockedForUser={true}
          />
        )
      },
      {
        name: 'unlocked lockable lesson',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              status: LevelStatus.not_tried
            }))}
          />
        )
      }
    ]);
};
