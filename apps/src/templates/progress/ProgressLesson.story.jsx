import React from 'react';
import { UnconnectedProgressLesson as ProgressLesson } from './ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { fakeLesson, fakeLevels } from './progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  lesson: fakeLesson('Maze', 1),
  levels: [
    {
      ...fakeLevels(1)[0],
      name: 'First progression'
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({...level, progression: 'Second Progression'})),
    {
      ...fakeLevels(1)[0],
      name: 'Last progression'
    },
  ],
  showTeacherInfo: false,
  viewAs: ViewType.Teacher,
  showLockIcon: true,
  lessonIsVisible: () => true,
  lessonLockedForSection: () => false
};

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLesson', module)
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
            viewAs={ViewType.Student}
            currentStageId={-1}
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
                  url: "/peer_reviews/1",
                  levelNumber: 1,
                },
                {
                  id: -1,
                  name: "Review a new submission",
                  status: LevelStatus.not_tried,
                  url: "/pull-review",
                  levelNumber: 2,
                },
                {
                  id: -1,
                  icon: 'fa-lock',
                  name: "Reviews unavailable at this time",
                  status: LevelStatus.locked,
                  url: "",
                  levelNumber: 3,
                },
                {
                  id: -1,
                  icon: 'fa-lock',
                  name: "Reviews unavailable at this time",
                  status: LevelStatus.locked,
                  url: "",
                  levelNumber: 4,
                },
              ]
            }
          />
        )
      },
      {
        name:'hidden progress lesson as teacher',
        description: 'should be white with full opacity',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) => viewAs === ViewType.Teacher}
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
        name:'locked lesson as teacher',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              status: LevelStatus.locked
            }))}
            lessonLockedForSection={() => true}
          />
        )
      },
      {
        name:'locked lesson as student',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Student}
            lesson={fakeLesson('Asessment Number One', 1, true)}
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              status: LevelStatus.locked
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
            levels={fakeLevels(5, {named: false}).map(level => ({
              ...level,
              status: LevelStatus.attempted
            }))}
          />
        )
      }
    ]);
};
