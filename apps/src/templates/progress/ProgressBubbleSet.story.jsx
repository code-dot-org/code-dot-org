import React from 'react';
import {UnconnectedProgressBubbleSet as ProgressBubbleSet} from './ProgressBubbleSet';
import {fakeLevels, fakeLevel} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

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

const diamondLevels = fakeLevels(2).map((level, index) => ({
  ...level,
  status: statusForLevel[index]
}));
diamondLevels[0].isConceptLevel = true;
diamondLevels[1].isConceptLevel = true;

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressBubbleSet', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'starting at 3',
        story: () => <ProgressBubbleSet levels={levels} disabled={false} />
      },
      {
        name: 'multiple lines',
        story: () => {
          const levels = fakeLevels(20);
          levels[2].icon = 'fa-video-camera';
          levels[12].icon = 'fa-video-camera';
          return <ProgressBubbleSet levels={levels} disabled={false} />;
        }
      },
      {
        name: 'disabled bubble set',
        description: 'should be white and not clickable',
        story: () => <ProgressBubbleSet levels={levels} disabled={true} />
      },
      {
        name: 'diamond bubbles only',
        description: 'diamonds should be aligned',
        story: () => (
          <ProgressBubbleSet levels={diamondLevels} disabled={false} />
        )
      },
      {
        name: 'includes a paired level',
        description: 'Should show the pair programming icon',
        story: () => (
          <ProgressBubbleSet
            levels={[fakeLevel({paired: true}), ...fakeLevels(5)]}
            disabled={false}
            pairingIconEnabled={true}
          />
        )
      },
      {
        name: 'first level is unplugged',
        description: 'Should get a pill for unplugged',
        story: () => (
          <ProgressBubbleSet
            levels={[fakeLevel({isUnplugged: true}), ...fakeLevels(5)]}
            disabled={false}
          />
        )
      },
      {
        name: 'only level is unplugged',
        description: 'Should get a pill for unplugged',
        story: () => (
          <ProgressBubbleSet
            levels={[fakeLevel({isUnplugged: true})]}
            disabled={false}
          />
        )
      }
    ]);
};
