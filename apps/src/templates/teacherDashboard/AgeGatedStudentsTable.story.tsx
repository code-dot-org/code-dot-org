import {StoryFn} from '@storybook/react';
import React from 'react';

import {
  filterAgeGatedStudents,
  RowType,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

import {UnconnectedAgeGatedStudentsTable} from './AgeGatedStudentsTable';

const sectionStudents = [
  {
    id: 1,
    name: 'Clark Kent',
    username: 'clark_kent',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: 'l',
  },
  {
    id: 2,
    name: 'Joe Smith',
    username: 'joe_smith',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: false,
    childAccountComplianceState: '',
  },
  {
    id: 3,
    name: 'test student',
    username: 'test_student3',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: 's',
  },
  {
    id: 4,
    name: 'fake student',
    username: 'fake_student4',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: false,
    childAccountComplianceState: 'p',
  },
  {
    id: 5,
    name: 'Kent Clark',
    username: 'fake_student5',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: '',
  },
];

export default {
  name: 'At Risk Age Gated Students Table (teacher dashboard)',
  component: UnconnectedAgeGatedStudentsTable,
};

const Template: StoryFn = args => (
  <UnconnectedAgeGatedStudentsTable {...args} />
);
export const TableForAgeGatedStudents = Template.bind({});
TableForAgeGatedStudents.args = {
  studentData: filterAgeGatedStudents(sectionStudents),
};
