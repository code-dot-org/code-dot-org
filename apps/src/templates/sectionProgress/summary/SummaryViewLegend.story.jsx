import React from 'react';
import SummaryViewLegend from './SummaryViewLegend';

export default storybook => {
  return storybook
    .storiesOf('Progress/SummaryViewLegend', module)
    .addStoryTable([
      {
        name: 'CSF',
        description: `CSF includes light green ProgressBox indicative of puzzles completed with too many blocks`,
        story: () => <SummaryViewLegend showCSFProgressBox={true} />
      },
      {
        name: 'CSD, CSP',
        description: `excludes CSF-specific light green ProgressBox`,
        story: () => <SummaryViewLegend showCSFProgressBox={false} />
      }
    ]);
};
