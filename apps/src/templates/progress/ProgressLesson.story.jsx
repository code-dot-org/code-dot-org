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
  lessonIsVisible: () => true
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
      }
    ]);
};
