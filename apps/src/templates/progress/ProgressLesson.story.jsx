import React from 'react';
import { UnconnectedProgressLesson as ProgressLesson } from './ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { fakeLesson, fakeLevels } from './progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  lesson: fakeLesson('Maze', 1),
  lessonNumber: 3,
  levels: [
    {
      status: LevelStatus.not_tried,
      url: '/step1/level1',
      name: 'First progression'
    },
    ...fakeLevels(5).map(level => ({...level, progression: 'Second Progression'})),
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
      name: 'Last progression'
    },
  ],
  showTeacherInfo: false,
  viewAs: ViewType.Teacher,
  lessonIsVisible: () => true,
  lessonLockedForSection: () => false
};

export default storybook => {
  storybook
    .storiesOf('ProgressLesson', module)
    .addStoryTable([
      {
        name:'progress lesson',
        story: () => (
          <ProgressLesson
            {...defaultProps}
          />
        )
      },
      {
        name:'hidden progress lesson as teacher',
        description: 'should be white with some opacity',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
          />
        )
      },
      {
        name:'hidden progress lesson as student',
        description: 'should not show up',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) => viewAs === ViewType.Teacher}
          />
        )
      },
      {
        name:'locked lesson',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5).map(level => ({
              ...level,
              status: LevelStatus.locked,
              name: undefined
            }))}
            lessonLockedForSection={() => true}
          />
        )
      },
      {
        name:'unlocked lockable lesson',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5).map(level => ({
              ...level,
              status: LevelStatus.attempted,
              name: undefined
            }))}
          />
        )
      }
    ]);
};
