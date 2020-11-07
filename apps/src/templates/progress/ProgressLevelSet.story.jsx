import React from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels
} from './progressTestHelpers';

const levels = fakeLevels(5).map((level, index) => ({
  ...level
}));
let progress = fakeProgressForLevels(levels);
progress[1].status = LevelStatus.perfect;

export default storybook => {
  storybook.storiesOf('Progress/ProgressLevelSet', module).addStoryTable([
    {
      name: 'single puzzle step',
      story: () => (
        <ProgressLevelSet
          name="Images, Pixels, and RGB"
          levels={levels.slice(0, 1)}
          disabled={false}
          studentProgress={progress}
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
          studentProgress={progress}
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
          studentProgress={progress}
        />
      )
    },
    {
      name: 'disabled',
      story: () => (
        <ProgressLevelSet
          name="Assessment"
          levels={levels}
          disabled={true}
          studentProgress={progress}
        />
      )
    },
    {
      name: 'Unnamed progression',
      story: () => (
        <ProgressLevelSet
          levels={levels}
          disabled={false}
          studentProgress={progress}
        />
      )
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
          studentProgress={progress}
        />
      )
    }
  ]);
};
