import React from 'react';
import CohortViewTable from './cohort_view_table';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('CohortViewTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Cohort view for teacher application',
        story: () => (
          <CohortViewTable
            data={[
              {
                id: 1,
                date_accepted: '11/1/2017',
                applicant_name: 'Poppy Pomfrey ',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'nurse@hogwarts.edu',
                notified: 'Yes',
                assigned_workshop: 'Seattle, 5/1',
                registered_workshop: 'Seattle, 5/1'
              },
              {
                id: 2,
                date_accepted: '12/1/2017',
                applicant_name: 'Filius Flitwick',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'short@hogwarts.edu',
                notified: 'Yes',
                assigned_workshop: 'TeacherCon Chicago',
                registered_workshop: 'TeacherCon Chicago'
              }
            ]}
            viewType="teacher"
            path="path"
          />
        )
      }, {
        name: 'Cohort view for facilitator application',
        story: () => (
          <CohortViewTable
            data={[
              {
                id: 1,
                date_accepted: '11/1/2017',
                applicant_name: 'Poppy Pomfrey ',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'nurse@hogwarts.edu',
                notified: 'Yes',
                assigned_workshop: 'Seattle, 5/1',
                registered_workshop: 'Seattle, 5/1',
                assigned_fit: 'Buffalo 6/1',
                registered_fit: 'Yes'
              },
              {
                id: 2,
                date_accepted: '12/1/2017',
                applicant_name: 'Filius Flitwick',
                district_name: 'UK Wizarding',
                school_name: 'Hogwarts',
                email: 'short@hogwarts.edu',
                notified: 'Yes',
                assigned_workshop: 'Seattle, 5/1',
                registered_workshop: 'Seattle, 5/1',
                assigned_fit: 'Buffalo 7/1',
                registered_fit: 'Yes',
              }
            ]}
            viewType="facilitator"
            path="path"
          />
        )
      }
    ]);
};
