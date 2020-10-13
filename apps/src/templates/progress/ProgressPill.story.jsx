import React from 'react';
import ProgressPill from './ProgressPill';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook.storiesOf('Progress/ProgressPill', module).addStoryTable([
    {
      name: 'single level pill',
      story: () => (
        <ProgressPill
          level={{
            url: '/level1'
          }}
          levelStatus={LevelStatus.perfect}
          icon="desktop"
          text="1"
        />
      )
    },
    {
      name: 'multi level pill',
      story: () => (
        <ProgressPill
          level={{
            url: '/level1'
          }}
          levelStatus={LevelStatus.perfect}
          multilevel={true}
          icon="desktop"
          text="1-4"
        />
      )
    },
    {
      name: 'unplugged pill',
      story: () => (
        <ProgressPill
          level={{
            url: '/level1'
          }}
          levelStatus={LevelStatus.perfect}
          text="Unplugged Activity"
        />
      )
    }
  ]);
};
