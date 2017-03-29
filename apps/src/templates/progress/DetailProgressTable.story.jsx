import React from 'react';
import { Provider } from 'react-redux';
import DetailProgressTable from './DetailProgressTable';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { fakeLesson, fakeLevels, createStoreWithHiddenLesson } from './progressTestHelpers';

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

// Export our stories so we can test them if we like
export const stories = [
  {
    name:'simple DetailProgressTable',
    story: () => (
      <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
        <DetailProgressTable
          lessons={lessons}
          levelsByLesson={levelsByLesson}
        />
      </Provider>
    )
  },
  {
    name:'with hidden lesson as teacher',
    description: 'lesson 2 should be white with dashed outline',
    story: () => (
      <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, '2')}>
        <DetailProgressTable
          lessons={lessons}
          levelsByLesson={levelsByLesson}
        />
      </Provider>
    )
  },
  {
    name:'with hidden lesson as student',
    description: 'lesson 2 should be invisible',
    story: () => (
      <Provider store={createStoreWithHiddenLesson(ViewType.Student, '2')}>
        <DetailProgressTable
          lessons={lessons}
          levelsByLesson={levelsByLesson}
        />
      </Provider>
    )
  }
];

export default storybook => {
  storybook
    .storiesOf('DetailProgressTable', module)
    .addStoryTable(stories);
};
