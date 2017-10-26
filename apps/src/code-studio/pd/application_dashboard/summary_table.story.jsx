import React from 'react';
import SummaryTable from './summary_table';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('SummaryTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Detail view for applications',
        story: () => (
          <SummaryTable
            caption="CSF Facilitators"
            path="csf_facilitators"
            data={{
              unreviewed: {
                locked: 0,
                unlocked: 1
              },
              pending: {
                locked: 10,
                unlocked: 11
              },
              accepted: {
                locked: 12,
                unlocked: 1
              },
              declined: {
                locked: 30,
                unlocked: 3
              },
              waitlisted: {
                locked: 5,
                unlocked: 6
              },
            }}
          />
        )
      }
    ]);
};
