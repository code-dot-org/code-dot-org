import React from 'react';
import {UnconnectedProgressLevelSet as ProgressLevelSet} from './ProgressLevelSet';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {fakeLevels, fakeLevel} from './progressTestHelpers';

const levels = fakeLevels(5).map((level, index) => ({
  ...level,
  status: index === 0 ? LevelStatus.perfect : level.status
}));

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLevelSet', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'single puzzle step',
        story: () => (
          <ProgressLevelSet
            name="Images, Pixels, and RGB"
            levels={levels.slice(0, 1)}
            disabled={false}
          />
        )
      },
      {
        name: 'multiple puzzle step',
        story: () => (
          <ProgressLevelSet
            name="Writing Exercises"
            levels={levels}
            disabled={false}
          />
        )
      },
      {
        name: 'non first step',
        story: () => (
          <ProgressLevelSet
            name="Writing Exercises"
            levels={fakeLevels(5, 4)}
            disabled={false}
          />
        )
      },
      {
        name: 'disabled',
        story: () => (
          <ProgressLevelSet name="Assessment" levels={levels} disabled={true} />
        )
      },
      {
        name: 'Unnamed progression',
        story: () => <ProgressLevelSet levels={levels} disabled={false} />
      },
      {
        name: 'with unplugged level',
        story: () => (
          <ProgressLevelSet
            name={undefined}
            levels={[fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(
              level => ({...level, name: undefined})
            )}
            disabled={false}
          />
        )
      }
    ]);
};
