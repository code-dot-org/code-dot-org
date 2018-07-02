import React from 'react';
import ProgressGroup from './ProgressGroup';
import { fakeLesson, fakeLevels, createStoreWithHiddenLesson } from './progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { Provider } from 'react-redux';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

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
    ...fakeLevels(5, {startLevel: 2}).map(level => ({...level, progression: 'Second Progression'})),
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
      name: 'Last progression',
      levelNumber: 7
    },
  ],
  fakeLevels(2),
  fakeLevels(2),
  fakeLevels(2)
];

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressGroup', module)
    .addStoryTable([
      {
        name:'ProgressGroup with detail view',
        story: () => (
          <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
            <ProgressGroup
              groupName="My Group"
              isPlc={false}
              isSummaryView={false}
              lessons={lessons}
              levelsByLesson={levelsByLesson}
            />
          </Provider>
        )
      },

      {
        name:'ProgressGroup with summary view',
        story: () => (
          <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
            <ProgressGroup
              groupName="My Group"
              isPlc={false}
              isSummaryView={true}
              lessons={lessons}
              levelsByLesson={levelsByLesson}
            />
          </Provider>
        )
      },

      {
        name:'ProgressGroup in PLC',
        story: () => (
          <Provider store={createStoreWithHiddenLesson(ViewType.Teacher, null)}>
            <ProgressGroup
              groupName="My Group"
              isPlc={true}
              isSummaryView={false}
              lessons={lessons}
              levelsByLesson={levelsByLesson}
            />
          </Provider>
        )
      },

    ]);
};
