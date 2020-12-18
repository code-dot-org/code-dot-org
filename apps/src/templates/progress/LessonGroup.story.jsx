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
      status: LevelStatus.not_tried,
      url: '/step1/level1',
      name: 'First progression',
      levelNumber: 1
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({
      ...level,
      progression: 'Second Progression'
    })),
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
      name: 'Last progression',
      levelNumber: 7
    }
  ],
  fakeLevels(2),
  fakeLevels(2),
  fakeLevels(2)
];

export default storybook => {
  storybook.storiesOf('Progress/LessonGroup', module).addStoryTable([
    {
      name: 'LessonGroup with detail view',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
          <LessonGroup
            lessonGroup={{displayName: 'My Group'}}
            isPlc={false}
            isSummaryView={false}
            lessons={lessons}
            levelsByLesson={levelsByLesson}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup in teacher summary view with one hidden lesson',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, 3)}>
          <LessonGroup
            lessonGroup={{displayName: 'My Group'}}
            isPlc={false}
            isSummaryView={true}
            lessons={lessons}
            levelsByLesson={levelsByLesson}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with all lessons hidden teacher summary view',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, 1)}>
          <LessonGroup
            lessonGroup={{
              displayName: 'My Group',
              description: 'Lesson Group Description',
              bigQuestions: 'Why? Who? Where?'
            }}
            isPlc={false}
            isSummaryView={true}
            lessons={[lessons[0]]}
            levelsByLesson={[levelsByLesson[0]]}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with all lessons hidden student summary view (empty)',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Student, 1)}>
          <LessonGroup
            lessonGroup={{
              displayName: 'My Group',
              description: 'Lesson Group Description',
              bigQuestions: 'Why? Who? Where?'
            }}
            isPlc={false}
            isSummaryView={true}
            lessons={[lessons[0]]}
            levelsByLesson={[levelsByLesson[0]]}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup in PLC',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
          <LessonGroup
            lessonGroup={{displayName: 'My Group'}}
            isPlc={true}
            isSummaryView={false}
            lessons={lessons}
            levelsByLesson={levelsByLesson}
          />
        </Provider>
      )
    },

    {
      name: 'LessonGroup with description and big questions',
      story: () => (
        <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
          <LessonGroup
            lessonGroup={{
              displayName: 'My Group',
              description: 'Lesson Group Description',
              bigQuestions: 'Why? Who? Where?'
            }}
            isPlc={false}
            isSummaryView={false}
            lessons={lessons}
            levelsByLesson={levelsByLesson}
          />
        </Provider>
      )
    }
  ]);
};
