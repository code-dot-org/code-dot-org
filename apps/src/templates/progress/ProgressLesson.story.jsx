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
        name:'progress lesson with focus area',
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
        name:'progress lesson for peer reviews',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={{
              id: -1,
              isFocusArea: false,
              lockable: false,
              name: "You must complete 4 reviews for this unit"
            }}
            levels={
              [
                {
                  id: -1,
                  name: "Link to submitted review",
                  status: LevelStatus.perfect,
                  url: "/peer_reviews/1"
                },
                {
                  id: -1,
                  name: "Review a new submission",
                  status: LevelStatus.not_tried,
                  url: "/pull-review"
                },
                {
                  id: -1,
                  icon: 'fa-lock',
                  name: "Reviews unavailable at this time",
                  status: LevelStatus.locked,
                  url: ""
                },
                {
                  id: -1,
                  icon: 'fa-lock',
                  name: "Reviews unavailable at this time",
                  status: LevelStatus.locked,
                  url: ""
                },
              ]
            }
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
