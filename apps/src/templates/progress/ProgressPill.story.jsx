import React from 'react';
import {UnconnectedProgressPill as ProgressPill} from './ProgressPill';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook.storiesOf('Progress/ProgressPill', module).addStoryTable([
    {
      name: 'single level pill',
      story: () => (
        <ProgressPill
          levels={[
            {
              id: '1',
              url: '/level1',
              status: LevelStatus.perfect,
              isLocked: false
            }
          ]}
          icon="desktop"
          text="1"
        />
      )
    },
    {
      name: 'multi level pill',
      story: () => (
        <ProgressPill
          levels={[
            {
              id: '1',
              url: '/level1',
              status: LevelStatus.perfect,
              isLocked: false
            },
            {
              id: '2',
              url: '/level2',
              status: LevelStatus.not_tried,
              isLocked: false
            }
          ]}
          icon="desktop"
          text="1-4"
        />
      )
    },
    {
      name: 'unplugged pill',
      story: () => (
        <ProgressPill
          levels={[
            {
              id: '1',
              url: '/level1',
              status: LevelStatus.perfect,
              isLocked: false
            }
          ]}
          text="Unplugged Activity"
        />
      )
    }
  ]);
};
