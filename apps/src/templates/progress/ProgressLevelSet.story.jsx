import React from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { fakeLevels } from './progressTestHelpers';

const multipleLevels = [
  {
    status: LevelStatus.perfect,
    url: '/foo/level1',
  }
].concat(fakeLevels(4));

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
            disabled={false}
          />
        )
      },
      {
        name:'multiple puzzle step',
        story: () => (
          <ProgressLevelSet
            start={1}
            name="Writing Exercises"
            levels={multipleLevels}
            disabled={false}
          />
        )
      },
      {
        name:'non first step',
        story: () => (
          <ProgressLevelSet
            start={4}
            name="Writing Exercises"
            levels={multipleLevels}
            disabled={false}
          />
        )
      },
      {
        name:'disabled',
        story: () => (
          <ProgressLevelSet
            start={1}
            name="Assessment"
            levels={multipleLevels}
            disabled={true}
          />
        )
      }
    ]);
};
