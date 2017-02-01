import React from 'react';
import ProgressLesson from './ProgressLesson';

export default storybook => {
  storybook
    .storiesOf('ProgressLesson', module)
    .addStoryTable([
      {
        name:'progress lesson',
        story: () => (
          <ProgressLesson
            title="Lesson 1: Bytes and File Sizes"
            levels={[
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
            ]}
          />
        )
      }
    ]);
};
