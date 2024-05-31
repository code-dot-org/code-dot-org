import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import manageStudents, {
  filterAgeGatedStudents,
  RowType,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
// @ts-expect-error Typescript type declaration error
import {reduxStore} from '@cdo/storybook/decorators';

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
  <Provider store={reduxStore({manageStudents})}>
    <UnconnectedAgeGatedStudentsTable {...args} />
  </Provider>
);
export const TableForAgeGatedStudents = Template.bind({});
TableForAgeGatedStudents.args = {
  studentData: filterAgeGatedStudents(sectionStudents),
};
