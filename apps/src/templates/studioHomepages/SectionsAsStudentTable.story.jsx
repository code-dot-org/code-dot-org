import React from 'react';
import SectionsAsStudentTable from './SectionsAsStudentTable';
import {action} from '@storybook/addon-actions';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

const sections = [
  {
    name: 'Algebra Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    numberOfStudents: 14,
    linkToStudents: 'to Manage Students tab',
    login_type: 'picture',
    code: 'ABCDEF',
  },
  {
    name: 'Algebra Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    numberOfStudents: 19,
    linkToStudents: 'to Manage Students tab',
    login_type: 'word',
    code: 'EEB206',
  },
  {
    name: 'Period 3',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 3',
    linkToAssigned: 'to Course',
    numberOfStudents: 22,
    linkToStudents: 'to Manage Students tab',
    login_type: 'email',
    code: 'HPRWHG',
  },
  {
    name: 'Period 4',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 4',
    linkToAssigned: 'to Course',
    numberOfStudents: 23,
    linkToStudents: 'to Manage Students tab',
    login_type: 'clever',
    code: 'C-GAIDFE',
  },
  {
    name: 'Period 5',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 5',
    linkToAssigned: 'to Course',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'to Unit',
    numberOfStudents: 24,
    linkToStudents: 'to Manage Students tab',
    login_type: 'google_classroom',
    code: 'G-DSLIGFDE',
  },
];

export default {
  title: 'SectionAsStudentTable',
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
