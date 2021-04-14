import React from 'react';
import {UnconnectedProgressLegend as ProgressLegend} from './ProgressLegend';

export default storybook => {
  storybook.storiesOf('Progress/ProgressLegend', module).addStoryTable([
    {
      name: 'progress legend - CSF',
      story: () => <ProgressLegend excludeCsfColumn={false} />
    },

    {
      name: 'progress legend - CSP',
      story: () => <ProgressLegend excludeCsfColumn={true} />
    }
  ]);
};
