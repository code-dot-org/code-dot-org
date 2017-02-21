import React from 'react';
import ProgressGroup from './ProgressGroup';

export default storybook => {
  storybook
    .storiesOf('ProgressGroup', module)
    .addStoryTable([
      {
        name:'ProgressGroup with detail view',
        story: () => (
          <ProgressGroup
            groupName="My Group"
            isSummaryView={false}
            lessons={[
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
            ]}
            levelsByLesson={[
              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                  name: 'First progression'
                },
                {
                  status: 'perfect',
                  url: '/step2/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level2',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level3',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level4',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level5',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                  name: 'Last progression'
                },
              ],

              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                },
              ],

              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                },
              ]
            ]}
          />
        )
      },

      {
        name:'ProgressGroup with summary view',
        story: () => (
          <ProgressGroup
            groupName="My Group"
            isSummaryView={true}
            lessons={[
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
            ]}
            levelsByLesson={[
              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                  name: 'First progression'
                },
                {
                  status: 'perfect',
                  url: '/step2/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level2',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level3',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level4',
                },
                {
                  status: 'not_tried',
                  url: '/step2/level5',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                  name: 'Last progression'
                },
              ],

              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                },
              ],

              [
                {
                  status: 'not_tried',
                  url: '/step1/level1',
                },
                {
                  status: 'not_tried',
                  url: '/step3/level1',
                },
              ]
            ]}
          />
        )
      },

    ]);
};
