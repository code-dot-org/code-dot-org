import React from 'react';
import CohortViewTable from './cohort_view_table';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('CohortViewTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Cohort view for application',
        story: () => (
          <CohortViewTable
            data={[
              {
                date_accepted: '11/1/2017',
                applicant_name: 'Poppy Pomfrey ',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'nurse@hogwarts.edu',
                registered_for_summer_workshop: 'Yes'
              },
              {
                date_accepted: '12/1/2017',
                applicant_name: 'Filius Flitwick',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'short@hogwarts.edu',
                registered_for_summer_workshop: 'No'
              }
            ]}
          />
        )
      }
    ]);
};
