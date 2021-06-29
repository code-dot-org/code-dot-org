import React from 'react';
import ProgressLegend from './ProgressLegend';

export default storybook => {
  storybook.storiesOf('Progress/ProgressLegend', module).addStoryTable([
    {
      name: 'progress legend - CSF',
      story: () => <ProgressLegend includeCsfColumn={true} />
    },

    {
      name: 'progress legend - CSP',
      story: () => <ProgressLegend includeCsfColumn={false} />
    },

    {
      name: 'progress legend - full',
      story: () => (
        <ProgressLegend
          includeCsfColumn
          includeProgressNotApplicable
          includeReviewState
        />
      )
    }
  ]);
};
