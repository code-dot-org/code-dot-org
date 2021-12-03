import React from 'react';
import LessonGroup from './LessonGroup';
import {
  fakeLesson,
  fakeLevels,
  createStoreWithHiddenLesson
} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {Provider} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const lessons = [
  fakeLesson('Jigsaw', 1),
  fakeLesson('Maze', 2),
  fakeLesson('Artist', 3),
  fakeLesson('Something', 4)
];
const levelsByLesson = [
  [
    {
      id: '20',
      status: LevelStatus.not_tried,
      isLocked: false,
      url: '/step1/level1',
      name: 'First progression',
      levelNumber: 1
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({
      ...level,
      progression: 'Second Progression'
    })),
    {
      id: '21',
      status: LevelStatus.not_tried,
      isLocked: false,
      url: '/step3/level1',
      name: 'Last progression',
      levelNumber: 7
    }
  ],
  fakeLevels(2),
  fakeLevels(2),
  fakeLevels(2)
];

const groupedLesson = {
  lessonGroup: {displayName: 'My Group'},
  lessons,
  levelsByLesson
};

export default storybook => {
  storybook.storiesOf('Progress/LessonGroup', module).addStoryTable([
    {
      name: 'LessonGroup with detail view',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <LessonGroup
            groupedLesson={groupedLesson}
            isPlc={false}
            isSummaryView={false}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup in instructor summary view with one hidden lesson',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 3)}>
          <LessonGroup
            groupedLesson={groupedLesson}
            isPlc={false}
            isSummaryView={true}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with all lessons hidden instructor summary view',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 1)}>
          <LessonGroup
            groupedLesson={{
              lessonGroup: {
                displayName: 'My Group',
                description: 'Lesson Group Description',
                bigQuestions: 'Why? Who? Where?'
              },
              lessons: [lessons[0]],
              levelsByLesson: [levelsByLesson[0]]
            }}
            isPlc={false}
            isSummaryView={true}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with no lessons instructor summary view',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 1)}>
          <LessonGroup
            groupedLesson={{
              lessonGroup: {
                displayName: 'My Group',
                description: 'Lesson Group Description',
                bigQuestions: 'Why? Who? Where?'
              },
              lessons: [],
              levelsByLesson: []
            }}
            isPlc={false}
            isSummaryView={true}
          />
        </Provider>
      )
    },

    {
      name:
        'LessonGroup with all lessons hidden participant summary view (empty)',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Participant, 1)}>
          <LessonGroup
            groupedLesson={{
              lessonGroup: {
                displayName: 'My Group',
                description: 'Lesson Group Description',
                bigQuestions: 'Why? Who? Where?'
              },
              lessons: [lessons[0]],
              levelsByLesson: [levelsByLesson[0]]
            }}
            isPlc={false}
            isSummaryView={true}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup in PLC',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <LessonGroup
            groupedLesson={groupedLesson}
            isPlc={true}
            isSummaryView={false}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with description and big questions',
      story: () => (
        <Provider
          store={createStoreWithHiddenLesson(ViewType.Instructor, null)}
        >
          <LessonGroup
            groupedLesson={{
              ...groupedLesson,
              lessonGroup: {
                displayName: 'My Group',
                description: 'Lesson Group Description',
                bigQuestions: 'Why? Who? Where?'
              }
            }}
            isPlc={false}
            isSummaryView={false}
          />
        </Provider>
      )
    }
  ]);
};
