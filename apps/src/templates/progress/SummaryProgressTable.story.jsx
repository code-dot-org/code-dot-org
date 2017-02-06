import React from 'react';
import SummaryProgressTable from './SummaryProgressTable';

export default storybook => {
  storybook
    .storiesOf('SummaryProgressTable', module)
    .addStoryTable([
      {
        name:'simple SummaryProgressTable',
        story: () => (
          <SummaryProgressTable
            lessonNames={['Jigsaw', 'Maze', 'Artist']}
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
      }
    ]);
};
