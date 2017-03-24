import React from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { fakeLevels } from './progressTestHelpers';

const levels = fakeLevels(5).map((level, index) => ({
  ...level,
  status: index === 0 ? LevelStatus.perfect : level.status
}));

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
            levels={levels.slice(0, 1)}
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
            levels={levels}
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
            levels={levels}
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
            levels={levels}
            disabled={true}
          />
        )
      }
    ]);
};
