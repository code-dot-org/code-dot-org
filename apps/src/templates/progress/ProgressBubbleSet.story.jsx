import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels
} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const statusForLevel = [
  LevelStatus.perfect,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.submitted
];
const levels = fakeLevels(5);
levels[0].isConceptLevel = true;

const diamondLevels = fakeLevels(2);
diamondLevels[0].isConceptLevel = true;
diamondLevels[1].isConceptLevel = true;

const unpluggedLevel = fakeLevel({id: 2, isUnplugged: true});

const studentProgress = fakeProgressForLevels(levels);
levels.forEach(
  (level, index) => (studentProgress[level.id].status = statusForLevel[index])
);

const pairedProgress = fakeProgressForLevels(levels);
pairedProgress[levels[0].id].paired = true;

export default storybook => {
  storybook.storiesOf('Progress/ProgressBubbleSet', module).addStoryTable([
    {
      name: 'starting at 3',
      story: () => (
        <ProgressBubbleSet
          levels={levels}
          studentProgress={studentProgress}
          disabled={false}
        />
      )
    },
    {
      name: 'multiple lines',
      story: () => {
        const levels = fakeLevels(20);
        levels[2].icon = 'fa-video-camera';
        levels[12].icon = 'fa-video-camera';
        return (
          <ProgressBubbleSet
            levels={levels}
            studentProgress={studentProgress}
            disabled={false}
          />
        );
      }
    },
    {
      name: 'disabled bubble set',
      description: 'should be white and not clickable',
      story: () => (
        <ProgressBubbleSet
          levels={levels}
          studentProgress={studentProgress}
          disabled={true}
        />
      )
    },
    {
      name: 'diamond bubbles only',
      description: 'diamonds should be aligned',
      story: () => (
        <ProgressBubbleSet
          levels={diamondLevels}
          studentProgress={studentProgress}
          disabled={false}
        />
      )
    },
    {
      name: 'includes a paired level',
      description: 'Should show the pair programming icon',
      story: () => (
        <ProgressBubbleSet
          levels={levels}
          studentProgress={pairedProgress}
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
          levels={[unpluggedLevel, ...levels]}
          studentProgress={studentProgress}
          disabled={false}
        />
      )
    },
    {
      name: 'only level is unplugged',
      description: 'Should get a pill for unplugged',
      story: () => (
        <ProgressBubbleSet
          levels={[unpluggedLevel]}
          studentProgress={studentProgress}
          disabled={false}
        />
      )
    }
  ]);
};
