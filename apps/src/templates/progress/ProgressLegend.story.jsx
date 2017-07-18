import React from 'react';
import ProgressLegend from './ProgressLegend';

export default storybook => {
  storybook
    .storiesOf('ProgressLegend', module)
    .addStoryTable([
      {
        name:'progress legend',
        story: () => (
          <ProgressLegend/>
        )
      },
    ]);
};
