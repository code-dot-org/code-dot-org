import React from 'react';
import ProgressStageStep from './ProgressStageStep';

export default storybook => {
  storybook
    .storiesOf('ProgressStageStep', module)
    .addStoryTable([
      {
        name:'single puzzle step',
        status: 'perfect',
        story: () => (
          <ProgressStageStep
            start={1}
            name="Images, Pixels, and RGB"
            levels={[
              {
                status: 'perfect',
                url: '/foo/level1',
              }
            ]}
          />
        )
      },
      {
        name:'multiple puzzle step',
        status: 'perfect',
        story: () => (
          <ProgressStageStep
            start={1}
            name="Writing Exercises"
            levels={[
              {
                status: 'perfect',
                url: '/foo/level1',
              },
              {
                status: 'not_tried',
                url: '/foo/level2',
              },
              {
                status: 'not_tried',
                url: '/foo/level3',
              },
              {
                status: 'not_tried',
                url: '/foo/level4',
              },
              {
                status: 'not_tried',
                url: '/foo/level5',
              },
            ]}
          />
        )
      },
      {
        name:'non first step',
        status: 'perfect',
        story: () => (
          <ProgressStageStep
            start={4}
            name="Writing Exercises"
            levels={[
              {
                status: 'perfect',
                url: '/foo/level1',
              },
              {
                status: 'not_tried',
                url: '/foo/level2',
              },
              {
                status: 'not_tried',
                url: '/foo/level3',
              },
              {
                status: 'not_tried',
                url: '/foo/level4',
              },
              {
                status: 'not_tried',
                url: '/foo/level5',
              },
            ]}
          />
        )
      }
    ]);
};
