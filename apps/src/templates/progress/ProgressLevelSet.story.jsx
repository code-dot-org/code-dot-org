import React from 'react';
import ProgressLevelSet from './ProgressLevelSet';

export default storybook => {
  storybook
    .storiesOf('ProgressLevelSet', module)
    .addStoryTable([
      {
        name:'single puzzle step',
        story: () => (
          <ProgressLevelSet
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
        story: () => (
          <ProgressLevelSet
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
        story: () => (
          <ProgressLevelSet
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
