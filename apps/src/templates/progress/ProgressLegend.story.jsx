import React from 'react';
import ProgressLegend from './ProgressLegend';

export default storybook => {
  storybook
    .storiesOf('ProgressLegend', module)
    .addStoryTable([
      {
        name:'progress legend - CSF',
        story: () => (
          <ProgressLegend csfColumn={true}/>
        )
      },

      {
        name:'progress legend - CSP',
        story: () => (
          <ProgressLegend csfColumn={false}/>
        )
      },
    ]);
};
