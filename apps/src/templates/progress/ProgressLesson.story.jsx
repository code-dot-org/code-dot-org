import React from 'react';
import {UnconnectedProgressLesson as ProgressLesson} from './ProgressLesson';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {fakeLesson, fakeLevels} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

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
  showTeacherInfo: false,
  viewAs: ViewType.Teacher,
  lessonIsVisible: () => true,
  lessonIsLockedForUser: () => false,
  lessonIsLockedForAllStudents: () => false,
  lockableAuthorized: true
};

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLesson', module)
    .withReduxStore()
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
            viewAs={ViewType.Student}
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
        name: 'hidden progress lesson as teacher',
        description: 'should be white with full opacity',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) => viewAs === ViewType.Teacher}
          />
        )
      },
      {
        name: 'hidden progress lesson as student',
        description: 'should not show up',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) => viewAs === ViewType.Student}
          />
        )
      },
      {
        name: 'locked lesson as verified teacher',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Assessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            lessonIsLockedForAllStudents={() => true}
          />
        )
      },
      {
        name: 'unlocked lesson as verified teacher',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            lessonIsLockedForAllStudents={() => false}
          />
        )
      },
      {
        name: 'locked lesson as unverified teacher',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            lessonIsLockedForUser={() => true}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'locked lesson signed out',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Student}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false})}
            lessonIsLockedForUser={() => true}
          />
        )
      },
      {
        name: 'locked lesson as student',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Student}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              isLocked: true
            }))}
            lessonIsLockedForUser={() => true}
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
