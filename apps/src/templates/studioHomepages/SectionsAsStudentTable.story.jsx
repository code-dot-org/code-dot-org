import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import SectionsAsStudentTable from './SectionsAsStudentTable';

const sections = [
  {
    name: 'Algebra Period 1',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    login_type: 'picture',
    code: 'ABCDEF',
  },
  {
    name: 'Algebra Period 2',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    login_type: 'word',
    code: 'EEB206',
  },
  {
    name: 'Period 3',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 3',
    linkToAssigned: 'to Course',
    login_type: 'email',
    code: 'HPRWHG',
  },
  {
    name: 'Period 4',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 4',
    linkToAssigned: 'to Course',
    login_type: 'clever',
    code: 'C-GAIDFE',
  },
  {
    name: 'Period 5',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 5',
    linkToAssigned: 'to Course',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'to Unit',
    login_type: 'google_classroom',
    code: 'G-DSLIGFDE',
  },
  {
    name: 'Period 6',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Single Unit Course',
    linkToAssigned: 'to Course',
    currentUnitTitle: 'Single Unit',
    linkToCurrentUnit: 'to Unit',
    is_assigned_single_unit_course: true,
    login_type: 'word',
    code: 'EEB206',
  },
];

export default {
  component: SectionsAsStudentTable,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <SectionsAsStudentTable
      sections={sections}
      updateSections={action('updateSections')}
      updateSectionsResult={action('updateSectionsResult')}
      {...args}
    />
  </Provider>
);

export const SectionCanLeave = Template.bind({});
SectionCanLeave.args = {
  canLeave: true,
};

export const SectionCannotLeave = Template.bind({});
SectionCannotLeave.args = {
  canLeave: false,
};
