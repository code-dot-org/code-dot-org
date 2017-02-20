import React from 'react';
import Immutable from 'immutable';
import { DetailProgressTable } from './DetailProgressTable';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

const lessons = [
  {
    name: 'Jigsaw',
    id: 1
  },
  {
    name: 'Maze',
    id: 2
  },
  {
    name: 'Artist',
    id: 3
  },
  {
    name: 'Something',
    id: 4
  },
];
const levelsByLesson = [
  [
    {
      status: LevelStatus.not_tried,
      url: '/step1/level1',
      name: 'First progression'
    },
    {
      status: LevelStatus.perfect,
      url: '/step2/level1',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step2/level2',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step2/level3',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step2/level4',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step2/level5',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
      name: 'Last progression'
    },
  ],
  [
    {
      status: LevelStatus.not_tried,
      url: '/step1/level1',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
    },
  ],
  [
    {
      status: LevelStatus.not_tried,
      url: '/step1/level1',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step3/level1',
    },
  ],
  [
    {
      status: LevelStatus.not_tried,
      url: '/step4/level1',
    },
    {
      status: LevelStatus.not_tried,
      url: '/step4/level1',
    },
  ]
];

export default storybook => {
  storybook
    .storiesOf('DetailProgressTable', module)
    .addStoryTable([
      {
        name:'simple DetailProgressTable',
        story: () => (
          <DetailProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            viewAs={ViewType.Teacher}
            sectionId={'11'}
            hiddenStageMap={Immutable.fromJS({
              '11': {}
            })}
          />
        )
      },
      {
        name:'with hidden lesson',
        story: () => (
          <DetailProgressTable
            lessons={lessons}
            levelsByLesson={levelsByLesson}
            viewAs={ViewType.Teacher}
            sectionId={'11'}
            hiddenStageMap={Immutable.fromJS({
              '11': {
                '2': true
              }
            })}
          />
        )
      }
    ]);
};
