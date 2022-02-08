import React from 'react';
import {UnconnectedSummaryProgressTable as SummaryProgressTable} from './SummaryProgressTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
  fakeLevel,
  createStoreWithHiddenLesson,
  createStoreWithLockedLesson
} from './progressTestHelpers';
import {Provider} from 'react-redux';

const defaultProps = {
  groupedLesson: {
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
    ]
  },
  viewAs: ViewType.Participant,
  lessonIsVisible: () => true
};

export default storybook => {
  storybook.storiesOf('Progress/SummaryProgressTable', module).addStoryTable([
    {
      name: 'simple SummaryProgressTable',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <SummaryProgressTable {...defaultProps} />
        </Provider>
      )
    },
    {
      name: 'SummaryProgressTable with focus area',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: defaultProps.groupedLesson.lessons.map(
                (lesson, index) => ({
                  ...lesson,
                  isFocusArea: index === 1
                })
              ),
              levelsByLesson: defaultProps.groupedLesson.levelsByLesson.map(
                (levels, index) => (index === 1 ? fakeLevels(8) : levels)
              )
            }}
            lessonIsVisible={() => true}
          />
        </Provider>
      )
    },
    {
      name: 'SummaryProgressTable for peer reviews',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <SummaryProgressTable
            groupedLesson={{
              lessons: [
                {
                  id: -1,
                  isFocusArea: false,
                  lockable: false,
                  name: 'You must complete 3 reviews for this unit'
                }
              ],
              levelsByLesson: [
                [
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
                  }
                ]
              ]
            }}
            lessonIsVisible={() => true}
          />
        </Provider>
      )
    },
    {
      name: 'second lesson is a hidden lesson, viewing as instructor',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, '2')}>
          <SummaryProgressTable
            {...defaultProps}
            viewAs={ViewType.Instructor}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Instructor
            }
          />
        </Provider>
      )
    },
    {
      name: 'third lesson is a hidden lesson, viewing as instructor',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, '3')}>
          <SummaryProgressTable
            {...defaultProps}
            viewAs={ViewType.Instructor}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 3 || viewAs === ViewType.Instructor
            }
          />
        </Provider>
      )
    },
    {
      name: 'second lesson is a hidden lesson, viewing as participant',
      description: 'Row 2 should not be visible',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Participant, '2')}
        >
          <SummaryProgressTable
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Instructor
            }
          />
        </Provider>
      )
    },
    {
      name: 'third row is a hidden lesson, viewing as participant',
      description: 'Row 3 should not be visible, gray still every other row',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Participant, '3')}
        >
          <SummaryProgressTable
            {...defaultProps}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 3 || viewAs === ViewType.Instructor
            }
          />
        </Provider>
      )
    },
    {
      name: 'locked lesson in current section as instructor',
      story: () => (
        <Provider
          store={createStoreWithLockedLesson(ViewType.Instructor, true)}
        >
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: [
                fakeLesson('Jigsaw', 1, false, 1),
                fakeLesson('Assessment One', 2, true),
                fakeLesson('Artist', 3, false, 2)
              ],
              levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)]
            }}
            viewAs={ViewType.Instructor}
          />
        </Provider>
      )
    },
    {
      name: 'locked lesson as participant',
      story: () => (
        <Provider store={createStoreWithLockedLesson(ViewType.Participant)}>
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: [
                fakeLesson('Jigsaw', 1, false, 1),
                fakeLesson('Assessment One', 2, true),
                fakeLesson('Artist', 3, false, 2)
              ],
              levelsByLesson: [
                fakeLevels(3),
                fakeLevels(4).map(level => ({
                  ...level,
                  isLocked: true
                })),
                fakeLevels(2)
              ]
            }}
          />
        </Provider>
      )
    },
    {
      name: 'unlocked lesson in current section as instructor',
      story: () => (
        <Provider
          store={createStoreWithLockedLesson(ViewType.Instructor, true)}
        >
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: [
                fakeLesson('Jigsaw', 1, false, 1),
                fakeLesson('Assessment One', 2, true),
                fakeLesson('Artist', 3, false, 2)
              ],
              levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)]
            }}
            viewAs={ViewType.Instructor}
            lessonIsVisible={() => true}
          />
        </Provider>
      )
    },
    {
      name: 'locked, hidden lesson as instructor',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, '2')}>
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: [
                fakeLesson('Jigsaw', 1, false, 1),
                fakeLesson('Assessment One', 2, true),
                fakeLesson('Artist', 3, false, 2)
              ],
              levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)]
            }}
            viewAs={ViewType.Instructor}
            lessonIsVisible={(lesson, viewAs) =>
              lesson.id !== 2 || viewAs === ViewType.Instructor
            }
          />
        </Provider>
      )
    },
    {
      name: 'unplugged lesson',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <SummaryProgressTable
            {...defaultProps}
            groupedLesson={{
              lessons: [fakeLesson('Lesson with Unplugged', 1, false, 1)],
              levelsByLesson: [
                [fakeLevel({isUnplugged: true}), ...fakeLevels(3)]
              ]
            }}
          />
        </Provider>
      )
    }
  ]);
};
