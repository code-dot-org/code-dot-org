import React from 'react';
import ProgressLegend from './ProgressLegend';

export default storybook => {
  storybook.storiesOf('Progress/ProgressLegend', module).addStoryTable([
    {
      name: 'progress legend - CSF',
      story: () => (
        <div style={{width: 970}}>
          <ProgressLegend includeCsfColumn={true} />
        </div>
      )
    },

    {
      name: 'progress legend - CSP',
      story: () => (
        <div style={{width: 970}}>
          <ProgressLegend includeCsfColumn={false} />
        </div>
      )
    },

    {
      name: 'progress legend - full',
      story: () => (
        <div style={{width: 970}}>
          <ProgressLegend
            includeCsfColumn
            includeProgressNotApplicable
            includeReviewStates
          />
        </div>
      )
    }
  ]);
};
