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
levels[0].isConceptLevel = true;

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressBubbleSet', module)
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
        story: () => {
          const levels = fakeLevels(20);
          levels[2].icon = 'fa-video-camera';
          levels[12].icon = 'fa-video-camera';
          return (
            <ProgressBubbleSet
              levels={levels}
              disabled={false}
            />
          );
        }
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
        description: 'Should get a pill for unplugged',
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
        name:'only level is unplugged',
        description: 'Should get a pill for unplugged',
        story: () => (
          <ProgressBubbleSet
            levels={[
              fakeLevel({ isUnplugged: true }),
            ]}
            disabled={false}
          />
        )
      },
    ]);
};
