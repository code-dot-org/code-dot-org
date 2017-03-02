import React from 'react';
import { UnconnectedSummaryProgressTable as SummaryProgressTable } from './SummaryProgressTable';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { fakeLesson, fakeLevels } from './progressTestHelpers';

const lessons = [
  fakeLesson('Jigsaw', 1, false, 1),
  fakeLesson('Maze', 2, false, 2),
  fakeLesson('Artist', 3, false, 3),
  fakeLesson('Something', 4, false, 4)
];
const levelsByLesson = [
  [
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
  fakeLevels(2),
  fakeLevels(2),
  fakeLevels(2)
];

export default storybook => {
  storybook
    .storiesOf('SummaryProgressTable', module)
    .addStoryTable([
      {
        name:'simple SummaryProgressTable',
        story: () => (
          <SummaryProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            lessonIsVisible={() => true}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'second lesson is a hidden stage, viewing as teacher',
        story: () => (
          <SummaryProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            lessonIsVisible={(lesson, viewAs) =>
              (lesson.id !== 2 || viewAs !== ViewType.Student)}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'third lesson is a hidden stage, viewing as teacher',
        story: () => (
          <SummaryProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            lessonIsVisible={(lesson, viewAs) =>
              (lesson.id !== 3 || viewAs !== ViewType.Student)}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'second lesson is a hidden stage, viewing as student',
        description: 'Row 2 should not be visible',
        story: () => (
          <SummaryProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            lessonIsVisible={(lesson, viewAs) =>
              (lesson.id !== 2 || viewAs === ViewType.Teacher)}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'third row is a hidden stage, viewing as student',
        description: 'Row 3 should not be visible',
        story: () => (
          <SummaryProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            lessonIsVisible={(lesson, viewAs) =>
              (lesson.id !== 3 || viewAs === ViewType.Teacher)}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'locked lesson in current section',
        story: () => (
          <SummaryProgressTable
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2),
            ]}
            levelsByLesson={[
              fakeLevels(3),
              fakeLevels(4),
              fakeLevels(2)
            ]}
            lessonIsVisible={() => true}
            lessonLockedForSection={(lessonId) => lessonId === 2}
          />
        )
      },
      {
        name:'locked lesson as student',
        story: () => (
          <SummaryProgressTable
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2),
            ]}
            levelsByLesson={[
              fakeLevels(3),
              fakeLevels(4).map(level => ({...level, status: LevelStatus.locked })),
              fakeLevels(2)
            ]}
            lessonIsVisible={() => true}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'unlocked lesson in current section',
        story: () => (
          <SummaryProgressTable
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2),
            ]}
            levelsByLesson={[
              fakeLevels(3),
              fakeLevels(4),
              fakeLevels(2)
            ]}
            lessonIsVisible={() => true}
            lessonLockedForSection={() => false}
          />
        )
      },
      {
        name:'locked, hidden lesson',
        story: () => (
          <SummaryProgressTable
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2),
            ]}
            levelsByLesson={[
              fakeLevels(3),
              fakeLevels(4),
              fakeLevels(2)
            ]}
            lessonIsVisible={(lesson, viewAs) =>
              (lesson.id !== 2 || viewAs !== ViewType.Student)}
            lessonLockedForSection={(lessonId) => lessonId === 2}
          />
        )
      }
    ]);
};
