import React from 'react';
import ProgressPill from './ProgressPill';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook
    .storiesOf('ProgressPill', module)
    .addStoryTable([
      {
        name: 'single level pill',
        story: () => (
          <ProgressPill
            url="/level1"
            status={LevelStatus.perfect}
            icon="desktop"
            text="1"
          />
        )
      },
      {
        name: 'multi level pill',
        story: () => (
          <ProgressPill
            status={LevelStatus.not_tried}
            icon="desktop"
            text="1-4"
          />
        )
      },
      {
        name: 'unplugged pill',
        story: () => (
          <ProgressPill
            url="/level1"
            status={LevelStatus.perfect}
            fontSize={12}
          />
        )
      }
    ]);
};
