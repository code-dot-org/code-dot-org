import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import { fakeLevels, fakeLevel } from './progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const statusForLevel = [
  LevelStatus.perfect,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.submitted
];
const levels = fakeLevels(5).map((level, index) => ({
  ...level,
  status: statusForLevel[index]
}));

export default storybook => {
  storybook
    .storiesOf('ProgressBubbleSet', module)
    .addStoryTable([
      {
        name:'starting at 3',
        story: () => (
          <ProgressBubbleSet
            levels={levels}
            disabled={false}
          />
        )
      },
      {
        name:'multiple lines',
        story: () => (
          <ProgressBubbleSet
            levels={fakeLevels(20)}
            disabled={false}
          />
        )
      },
      {
        name:'disabled bubble set',
        description: 'should be white and not clickable',
        story: () => (
          <ProgressBubbleSet
            levels={levels}
            disabled={true}
          />
        )
      },
      {
        name:'first level is unplugged',
        description: 'should be a pill for unplugged',
        story: () => (
          <ProgressBubbleSet
            levels={[
              fakeLevel({ isUnplugged: true }),
              ...fakeLevels(5)
            ]}
            disabled={false}
          />
        )
      },
      {
        name:'level is go beyond',
        story: () => (
          <ProgressBubbleSet
            levels={[
              fakeLevel({ isUnplugged: true, isGoBeyond: true })
            ]}
            disabled={false}
          />
        )
      },
    ]);
};
