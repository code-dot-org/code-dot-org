import React from 'react';

import {WorkshopTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {CohortViewTable} from './cohort_view_table';

export default {
  component: CohortViewTable,
};

const Template = args => <CohortViewTable path="path" {...args} />;

export const CohortViewTeacherApp = Template.bind({});
CohortViewTeacherApp.args = {
  data: [
    {
      id: 1,
      date_accepted: '2017-11-01',
      applicant_name: 'Poppy Pomfrey ',
      district_name: 'UK Wizarding',
      school_name: 'Hogwarts',
      email: 'nurse@hogwarts.edu',
      notified: 'Yes',
      assigned_workshop: 'Chicago Summer Workshop 6/1',
      registered_workshop_id: 1,
    },
    {
      id: 2,
      date_accepted: '2017-12-01',
      applicant_name: 'Filius Flitwick',
      district_name: 'UK Wizarding',
      school_name: 'Hogwarts',
      email: 'short@hogwarts.edu',
      notified: 'Yes',
      assigned_workshop: 'Chicago Summer Workshop 6/1',
      registered_workshop_id: 2,
    },
  ],
  viewType: 'teacher',
  regionalPartnerFilter: {
    value: 2,
    label: 'WNY Stem Hub',
  },
  regionalPartners: [
    {
      id: 1,
      workshop_type: WorkshopTypes.local_summer,
    },
    {
      id: 2,
      workshop_type: WorkshopTypes.local_summer,
    },
  ],
};
