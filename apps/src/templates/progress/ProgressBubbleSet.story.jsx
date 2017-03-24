import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import { fakeLevels } from './progressTestHelpers';
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
            start={3}
            levels={levels}
            disabled={false}
          />
        )
      },
      {
        name:'multiple lines',
        story: () => (
          <ProgressBubbleSet
            start={1}
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
            start={1}
            levels={levels}
            disabled={true}
          />
        )
      },
      {
        name:'first level is unplugged',
        description: 'Should still get a bubble (not a pill) for unplugged',
        story: () => (
          <ProgressBubbleSet
            start={1}
            levels={fakeLevels(5).map((level, index) => ({
              ...level,
              isUnplugged: index === 0
            }))}
            disabled={false}
          />
        )
      },
    ]);
};
