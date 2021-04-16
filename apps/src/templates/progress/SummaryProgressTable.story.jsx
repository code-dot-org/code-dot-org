import React from 'react';
import {UnconnectedSummaryProgressTable as SummaryProgressTable} from './SummaryProgressTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {fakeLesson, fakeLevels, fakeLevel} from './progressTestHelpers';

const defaultProps = {
  lessons: [
    fakeLesson('Jigsaw', 1, false, 1),
    fakeLesson('Maze', 2, false, 2),
    fakeLesson('Artist', 3, false, 3),
    fakeLesson('Something', 4, false, 4)
  ],
  levelsByLesson: [
    [
      {
        ...fakeLevels(1)[0],
        name: 'First progression'
      },
      ...fakeLevels(5, 2).map(level => ({
        ...level,
        progression: 'Second Progression'
      })),
      {
        ...fakeLevels(1)[0],
        name: 'Last progression'
      }
    ],
    fakeLevels(2),
    fakeLevels(2),
    fakeLevels(2)
  ],
  lessonIsVisible: () => true,
  lessonIsLockedForUser: () => false,
  lockableAuthorized: false,
  viewAs: ViewType.Student
};

export default storybook => {
  storybook
    .storiesOf('Progress/SummaryProgressTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'simple SummaryProgressTable',
        story: () => <SummaryProgressTable {...defaultProps} />
      },
      {
        name: 'SummaryProgressTable with focus area',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={defaultProps.lessons.map((lesson, index) => ({
              ...lesson,
              isFocusArea: index === 1
            }))}
            levelsByLesson={defaultProps.levelsByLesson.map((levels, index) =>
              index === 1 ? fakeLevels(8) : levels
            )}
            lessonIsVisible={() => true}
          />
        )
      },
      {
        name: 'SummaryProgressTable for peer reviews',
        story: () => (
          <SummaryProgressTable
            lessons={[
              {
                id: -1,
                isFocusArea: false,
                lockable: false,
                name: 'You must complete 3 reviews for this unit'
              }
            ]}
            levelsByLesson={[
              [
                {
                  id: '-1',
                  name: 'Link to submitted review',
                  status: LevelStatus.perfect,
                  url: '/peer_reviews/1',
                  levelNumber: 1
                },
                {
                  id: '-1',
                  name: 'Review a new submission',
                  status: LevelStatus.not_tried,
                  url: '/pull-review',
                  levelNumber: 2
                },
                {
                  id: '-1',
                  icon: 'fa-lock',
                  name: 'Reviews unavailable at this time',
                  status: LevelStatus.locked,
                  url: '',
                  levelNumber: 3
                }
              ]
            ]}
            lessonIsVisible={() => true}
            lessonIsLockedForUser={() => false}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'second lesson is a hidden stage, viewing as teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            viewAs={ViewType.Teacher}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Teacher
            }
          />
        )
      },
      {
        name: 'third lesson is a hidden stage, viewing as teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            viewAs={ViewType.Teacher}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 3 || viewAs === ViewType.Teacher
            }
          />
        )
      },
      {
        name: 'second lesson is a hidden stage, viewing as student',
        description: 'Row 2 should not be visible',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Teacher
            }
          />
        )
      },
      {
        name: 'third row is a hidden stage, viewing as student',
        description: 'Row 3 should not be visible, gray still every other row',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 3 || viewAs === ViewType.Teacher
            }
          />
        )
      },
      {
        name: 'lockable lesson locked for section as verified teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsLockedForUser={lesson => lesson.lockable}
            lockableAuthorized={true}
          />
        )
      },
      {
        name: 'lockable lesson unlocked for section as verified teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsLockedForUser={() => false}
            lockableAuthorized={true}
          />
        )
      },
      {
        name: 'lockable lesson as non-verified teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsLockedForUser={lesson => lesson.lockable}
          />
        )
      },
      {
        name: 'locked lesson as student',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[
              fakeLevels(3),
              fakeLevels(4).map(level => ({
                ...level,
                status: LevelStatus.locked
              })),
              fakeLevels(2)
            ]}
            lessonIsLockedForUser={lesson => lesson.lockable}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'locked lesson as signed out user',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            lessonIsLockedForUser={lesson => lesson.lockable}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'unlocked lesson in current section as teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsVisible={() => true}
          />
        )
      },
      {
        name: 'locked, hidden lesson as verified teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Teacher
            }
            lessonIsLockedForUser={lesson => lesson.lockable}
            lockableAuthorized={true}
          />
        )
      },
      {
        name: 'locked, hidden lesson as non-verified teacher',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[
              fakeLesson('Jigsaw', 1, false, 1),
              fakeLesson('Assessment One', 2, true),
              fakeLesson('Artist', 3, false, 2)
            ]}
            levelsByLesson={[fakeLevels(3), fakeLevels(4), fakeLevels(2)]}
            viewAs={ViewType.Teacher}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Teacher
            }
            lessonIsLockedForUser={lesson => lesson.lockable}
            lockableAuthorized={false}
          />
        )
      },
      {
        name: 'unplugged lesson',
        story: () => (
          <SummaryProgressTable
            {...defaultProps}
            lessons={[fakeLesson('Stage with Unplugged', 1, false, 1)]}
            levelsByLesson={[
              [fakeLevel({isUnplugged: true}), ...fakeLevels(3)]
            ]}
          />
        )
      }
    ]);
};
